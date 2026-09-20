import {FC} from 'react';
import imagePath from '../../../shared/utils/imagePath.ts';

export interface IconProps {
    name: string,
    width?: number,
    height?: number
}

const Icon: FC<IconProps> = (icon) => {
    return (
        <svg className={`icon-${icon.name}`} width={icon.width} height={icon.height ? icon.height : icon.width}>
            <use xlinkHref={`${imagePath('symbols.svg')}#${icon.name}`}></use>
        </svg>
    );
};

export default Icon;
