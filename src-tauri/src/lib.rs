use image::{codecs::jpeg::JpegEncoder, imageops::FilterType, DynamicImage, ImageFormat};
use std::io::Cursor;

fn encode_image(
    data: Vec<u8>,
    format: String,
    quality: u8,
    max_width: Option<u32>,
    scale: f64,
) -> Result<Vec<u8>, String> {
    let mut image = image::load_from_memory(&data)
        .map_err(|error| format!("Image decoding failed: {error}"))?;

    if !scale.is_finite() || scale <= 0.0 || scale > 4.0 {
        return Err("Invalid scale".into());
    }

    let max_dimension = 8000.0;
    let requested_scale = match max_width.filter(|width| *width > 0) {
        Some(width) => (width.min(8000) as f64 / image.width() as f64).min(1.0),
        None => scale,
    };
    let factor = requested_scale.min(max_dimension / image.width().max(image.height()) as f64);

    if factor != 1.0 {
        let width = (image.width() as f64 * factor).round().max(1.0) as u32;
        let height = (image.height() as f64 * factor).round().max(1.0) as u32;
        image = image.resize_exact(width, height, FilterType::Lanczos3);
    }

    match format.as_str() {
        "webp" => {
            let rgba = image.to_rgba8();
            Ok(webp::Encoder::from_rgba(&rgba, rgba.width(), rgba.height())
                .encode(quality.clamp(1, 100) as f32)
                .to_vec())
        }
        "jpeg" => {
            let mut output = Vec::new();
            JpegEncoder::new_with_quality(&mut output, quality.clamp(1, 100))
                .encode_image(&DynamicImage::ImageRgb8(image.to_rgb8()))
                .map_err(|error| format!("JPEG encoding failed: {error}"))?;
            Ok(output)
        }
        "png" => {
            let mut output = Cursor::new(Vec::new());
            image
                .write_to(&mut output, ImageFormat::Png)
                .map_err(|error| format!("PNG encoding failed: {error}"))?;
            Ok(output.into_inner())
        }
        _ => Err(format!("Unsupported output format: {format}")),
    }
}

#[tauri::command]
async fn process_image(request: tauri::ipc::Request<'_>) -> Result<tauri::ipc::Response, String> {
    let data = match request.body() {
        tauri::ipc::InvokeBody::Raw(data) => data.clone(),
        _ => return Err("Binary image payload expected".into()),
    };
    let format = request
        .headers()
        .get("format")
        .and_then(|value| value.to_str().ok())
        .ok_or("Missing output format")?
        .to_owned();
    let quality = request
        .headers()
        .get("quality")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.parse::<u8>().ok())
        .ok_or("Invalid quality")?;
    let max_width = request
        .headers()
        .get("max-width")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.parse::<u32>().ok())
        .filter(|value| *value > 0);

    let scale = request
        .headers()
        .get("scale")
        .map(|value| {
            value
                .to_str()
                .ok()
                .and_then(|value| value.parse::<f64>().ok())
                .ok_or("Invalid scale")
        })
        .transpose()?
        .unwrap_or(1.0);

    let output = tauri::async_runtime::spawn_blocking(move || {
        encode_image(data, format, quality, max_width, scale)
    })
    .await
    .map_err(|error| format!("Image processing task failed: {error}"))??;

    Ok(tauri::ipc::Response::new(output))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![process_image])
        .run(tauri::generate_context!())
        .expect("error while running Image Converter");
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{ImageBuffer, Rgba};

    #[test]
    fn native_resize_caps_oversized_sources_and_width_inputs() {
        let source =
            DynamicImage::ImageRgba8(ImageBuffer::from_pixel(10000, 1, Rgba([80, 140, 220, 255])));
        let mut png = Cursor::new(Vec::new());
        source.write_to(&mut png, ImageFormat::Png).unwrap();
        let data = png.into_inner();

        for (max_width, scale) in [(None, 3.0), (Some(8000000), 1.0)] {
            let encoded = encode_image(data.clone(), "png".into(), 85, max_width, scale).unwrap();
            let result = image::load_from_memory(&encoded).unwrap();
            assert_eq!(result.width(), 8000);
            assert_eq!(result.height(), 1);
        }
    }

    #[test]
    fn native_resize_supports_fractional_scale_and_width_limits() {
        let source =
            DynamicImage::ImageRgba8(ImageBuffer::from_pixel(80, 40, Rgba([80, 140, 220, 255])));
        let mut png = Cursor::new(Vec::new());
        source.write_to(&mut png, ImageFormat::Png).unwrap();
        let data = png.into_inner();

        for (scale, max_width, dimensions) in [
            (0.5, None, (40, 20)),
            (0.75, None, (60, 30)),
            (2.0, None, (160, 80)),
            (4.0, None, (320, 160)),
            (2.0, Some(20), (20, 10)),
            (2.0, Some(100), (80, 40)),
        ] {
            let encoded = encode_image(data.clone(), "png".into(), 85, max_width, scale).unwrap();
            let result = image::load_from_memory(&encoded).unwrap();
            assert_eq!((result.width(), result.height()), dimensions);
        }
    }

    #[test]
    fn native_webp_encoder_returns_a_real_webp_file() {
        let source =
            DynamicImage::ImageRgba8(ImageBuffer::from_pixel(32, 32, Rgba([80, 140, 220, 255])));
        let mut png = Cursor::new(Vec::new());
        source.write_to(&mut png, ImageFormat::Png).unwrap();

        let encoded = encode_image(png.into_inner(), "webp".into(), 85, None, 1.0).unwrap();

        assert_eq!(&encoded[0..4], b"RIFF");
        assert_eq!(&encoded[8..12], b"WEBP");
    }
}
