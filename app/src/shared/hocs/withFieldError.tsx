import React from 'react';
import cn from 'clsx';

export interface WithFieldErrorProps {
    className?: string;
    classNameInput?: string;
    hasError?: string | undefined | React.ReactNode;
}

const withFieldError = <T extends WithFieldErrorProps>(Component: React.ComponentType<T>) => {
    const WrappedComponent = ({ className, classNameInput, hasError, ...props }: T) => (
        <div className={cn(hasError && 'has-error', className)}>
            <Component className={classNameInput} {...props as T} />
            {hasError && <div role="alert">{hasError}</div>}
        </div>
    );

    WrappedComponent.displayName = `withFieldError(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
};

export default withFieldError;
