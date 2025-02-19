import { Button } from '@proton/atoms';
import { Icon, Tooltip, classnames } from '@proton/components';

import { TransfersManagerButtonsProps } from './interfaces';

const Buttons = ({ className, buttons, id }: TransfersManagerButtonsProps) => {
    const elClassName = classnames(['flex flex-nowrap flex-justify-end', className]);

    return (
        <div className={elClassName} id={id}>
            {buttons.map(({ disabled, onClick, title, testId, iconName }) => (
                <Tooltip title={title} key={title}>
                    <Button
                        icon
                        type="button"
                        disabled={disabled}
                        onClick={onClick}
                        className="transfers-manager-list-item-controls-button on-rtl-mirror"
                        data-testid={testId ? testId : undefined}
                    >
                        <Icon size={12} name={iconName} />
                    </Button>
                </Tooltip>
            ))}
        </div>
    );
};

export default Buttons;
