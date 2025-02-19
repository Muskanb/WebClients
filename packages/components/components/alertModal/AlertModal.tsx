import { ReactElement, ReactNode, cloneElement, useContext } from 'react';

import { classnames } from '../../helpers';
import { ModalContentProps, ModalContext, ModalProps, ModalTwo, ModalTwoContent, ModalTwoFooter } from '../modalTwo';

import './AlertModal.scss';

const AlertModalTitle = ({ children }: { children: ReactNode }) => (
    <h3 id={useContext(ModalContext).id} className="text-lg text-bold">
        {children}
    </h3>
);

export interface AlertModalProps extends Omit<ModalProps, 'children' | 'size' | 'title'> {
    title: string | JSX.Element;
    subline?: string;
    buttons: JSX.Element | [JSX.Element] | [JSX.Element, JSX.Element] | [JSX.Element, JSX.Element, JSX.Element];
    children: ReactNode;
    ModalContentProps?: ModalContentProps;
}

const AlertModal = ({ title, subline, buttons, className, children, ModalContentProps, ...rest }: AlertModalProps) => {
    const buttonArray = Array.isArray(buttons) ? buttons : [buttons];

    const [firstButton, secondButton, thirdButton] = buttonArray.map((child) =>
        cloneElement(child as ReactElement, { fullWidth: true })
    );

    return (
        <ModalTwo size="small" {...rest} className={classnames([className, 'alert-modal'])}>
            <div className="alert-modal-header">
                <AlertModalTitle>{title}</AlertModalTitle>
                {subline && <div className="color-weak text-break">{subline}</div>}
            </div>
            <ModalTwoContent {...ModalContentProps}>{children}</ModalTwoContent>
            <ModalTwoFooter className="alert-modal-footer">
                {firstButton}
                {secondButton}
                {thirdButton}
            </ModalTwoFooter>
        </ModalTwo>
    );
};

export default AlertModal;
