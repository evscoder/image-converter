import {ComponentPropsWithoutRef, ReactNode, forwardRef} from 'react';
import s from './UiButton.module.scss';
import cn from 'clsx';
import {Colors, Rounded, Sizes} from '../../../types/types.ts';
import {Link} from 'react-router-dom';

type BaseButtonProps = {
    color?: Colors;
    size?: Sizes;
    rounded?: Rounded;
    classNames?: string;
    disabled?: boolean;
    children?: ReactNode;
};

type NativeButtonProps = BaseButtonProps & Omit<ComponentPropsWithoutRef<'button'>, 'color' | 'disabled'> & {
    link?: false;
    href?: never;
};

type LinkButtonProps = BaseButtonProps & Omit<ComponentPropsWithoutRef<typeof Link>, 'color' | 'to'> & {
    link: true;
    href: string;
};

export type ButtonProps = NativeButtonProps | LinkButtonProps;

const UiButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const color = props.color ?? 'primary';
    const size = props.size ?? 'md';
    const rounded = props.rounded ?? 'md';
    const buttonClasses = cn(
        s.button,
        s[`button--${color}`],
        s[`button--${size}`],
        s[`button--rounded-${rounded}`],
        props.disabled && s['button--disabled'],
        props.classNames
    );

    if (props.link) {
        return (
            <Link
                {...props}
                aria-disabled={props.disabled}
                data-testid={props.id}
                to={props.href}
                className={buttonClasses}
            >
                { props.children }
            </Link>
        );
    }

    return (
        <button {...props} ref={ref} data-testid={props.id} className={buttonClasses}>
            { props.children }
        </button>
    );
});

export default UiButton;
