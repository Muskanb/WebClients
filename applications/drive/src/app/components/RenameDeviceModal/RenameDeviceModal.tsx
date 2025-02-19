import React, { useState } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import {
    Form,
    InputFieldTwo,
    ModalTwo,
    ModalTwoContent,
    ModalTwoFooter,
    ModalTwoHeader,
    Row,
    useFormErrors,
    useLoading,
} from '@proton/components';
import { requiredValidator } from '@proton/shared/lib/helpers/formValidators';
import noop from '@proton/utils/noop';

import { Device, useActions } from '../../store';

interface Props {
    onClose?: () => void;
    device: Device;
    open?: boolean;
}

const RenameDeviceModal = ({ device, onClose, open }: Props) => {
    const { renameDevice } = useActions();
    const [submitting, withSubmitting] = useLoading();

    const { validator, onFormSubmit } = useFormErrors();
    const [model, setModel] = useState(() => {
        return {
            name: device.name,
        };
    });

    const handleSubmit = async () => {
        if (!onFormSubmit()) {
            return;
        }

        return renameDevice({ deviceId: device.id, newName: model.name }).then(() => {
            onClose?.();
        });
    };

    const deviceNameValidation = validator([requiredValidator(model.name)]);

    return (
        <ModalTwo
            as={Form}
            disableCloseOnEscape={submitting}
            onClose={onClose}
            onReset={onClose}
            onSubmit={() => withSubmitting(handleSubmit()).catch(noop)}
            open={open}
            size="small"
        >
            <ModalTwoHeader closeButtonProps={{ disabled: submitting }} title={c('Title').t`Rename device`} />
            <ModalTwoContent>
                <Row className="mt1 mb1">
                    <InputFieldTwo
                        aria-required
                        autoFocus
                        label={c('Label').t`Device name`}
                        placeholder={c('Placeholder').t`Enter device name`}
                        title={c('Label').t`Enter device name`}
                        error={deviceNameValidation}
                        value={model.name}
                        onValue={(value: string) => setModel({ name: value })}
                    />
                </Row>
            </ModalTwoContent>
            <ModalTwoFooter>
                <Button type="button" onClick={onClose} disabled={submitting}>
                    {c('Action').t`Cancel`}
                </Button>
                <Button type="submit" loading={submitting} disabled={device.name === model.name} color="norm">
                    {c('Action').t`Rename`}
                </Button>
            </ModalTwoFooter>
        </ModalTwo>
    );
};

export default RenameDeviceModal;
