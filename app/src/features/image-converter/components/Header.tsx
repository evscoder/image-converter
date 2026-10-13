import clsx from 'clsx';
import { Aperture } from 'lucide-react';

export const Header = () => (
    <header
        className={clsx(
            'app-header flex shrink-0 items-center gap-6 p-[0_20px] [border-bottom:1px_solid_#111] min-h-[60px]',
            '[background:linear-gradient(105deg,_#2e4948_0%,_#2c4148_22%,_#2a363b_40%,_#26282c_65%)]'
        )}
    >
        <div className="app-header__brand flex items-center gap-[9px] text-[14px] font-semibold">
            <span
                className={clsx(
                    'app-header__logo grid place-items-center [border:1px_solid_#43b9ae66] size-[34px] ',
                    'rounded-[10px] [background:#26bbab26] text-[#8ce4d2]'
                )}
            >
                <Aperture size={19} strokeWidth={1.7} />
            </span>
            <span>Image Converter</span>
        </div>
        <span
            className={clsx(
                'app-header__description pl-[24px] [border-left:1px_solid_#494949]',
                'text-[#a0a0a0] text-[12px] max-[761px]:hidden'
            )}
        >
            Конвертер изображений
        </span>
        <span className="app-header__workspace ml-auto text-[11px] p-[6px_10px] [border:1px_solid_#355561] rounded-[7px] text-[#bdc5d7]">
            Рабочая область
        </span>
    </header>
);
