import clsx from 'clsx';
import type { ReactNode } from 'react';

interface ControlFieldProps {
    label: string;
    children: ReactNode;
    disabled?: boolean;
}

export const inputClassName = 'ui-input';

export const ControlField = ({ label, children, disabled = false }: ControlFieldProps) => (
    <label className={clsx('ui-field', disabled && 'ui-field--disabled')}>
        <span className="ui-field__label">{label}</span>
        {children}
    </label>
);
