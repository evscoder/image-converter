use image::{codecs::jpeg::JpegEncoder, imageops::FilterType, DynamicImage, ImageFormat};
use std::io::Cursor;

fn encode_image(
    data: Vec<u8>,
    format: String,
    quality: u8,
    max_width: Option<u32>,
) -> Result<Vec<u8>, String> {
    let mut image = image::load_from_memory(&data)
        .map_err(|error| format!("Image decoding failed: {error}"))?;

    if let Some(max_width) = max_width.filter(|width| *width > 0) {
        if image.width() > max_width {
            let height = ((image.height() as f64 * max_width as f64) / image.width() as f64)
                .round()
                .max(1.0) as u32;
            image = image.resize_exact(max_width, height, FilterType::Lanczos3);
        }
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

    let output = tauri::async_runtime::spawn_blocking(move || {
        encode_image(data, format, quality, max_width)
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
        .expect("error while running ImageMAG Converter");
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{ImageBuffer, Rgba};

    #[test]
    fn native_webp_encoder_returns_a_real_webp_file() {
        let source =
            DynamicImage::ImageRgba8(ImageBuffer::from_pixel(32, 32, Rgba([80, 140, 220, 255])));
        let mut png = Cursor::new(Vec::new());
        source.write_to(&mut png, ImageFormat::Png).unwrap();

        let encoded = encode_image(png.into_inner(), "webp".into(), 85, None).unwrap();

        assert_eq!(&encoded[0..4], b"RIFF");
        assert_eq!(&encoded[8..12], b"WEBP");
    }
}
