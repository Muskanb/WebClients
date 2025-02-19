import { FormEvent, useState } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { updateAddress } from '@proton/shared/lib/api/addresses';
import { requiredValidator } from '@proton/shared/lib/helpers/formValidators';
import { Address } from '@proton/shared/lib/interfaces';

import {
    InputFieldTwo,
    ModalTwo as Modal,
    ModalTwoContent as ModalContent,
    ModalTwoFooter as ModalFooter,
    ModalTwoHeader as ModalHeader,
    ModalProps,
    useFormErrors,
} from '../../components';
import { useApi, useEventManager, useLoading, useNotifications } from '../../hooks';

interface Props extends ModalProps<'form'> {
    address: Address;
}

const EditDisplayNameModal = ({ address, ...rest }: Props) => {
    const [initialDisplayName] = useState(address.DisplayName);
    const [model, setModel] = useState('');
    const { createNotification } = useNotifications();
    const { validator, onFormSubmit } = useFormErrors();
    const [submitting, withLoading] = useLoading();
    const api = useApi();
    const { call } = useEventManager();

    const handleSubmit = async () => {
        await api(
            updateAddress(address.ID, {
                DisplayName: model,
                Signature: address.Signature,
            })
        );
        await call();
        createNotification({ text: c('Success').t`Display name updated` });
        rest.onClose?.();
    };

    const handleClose = submitting ? undefined : rest.onClose;

    return (
        <Modal
            as="form"
            size="small"
            {...rest}
            onSubmit={(event: FormEvent) => {
                event.preventDefault();
                event.stopPropagation();
                if (!onFormSubmit()) {
                    return;
                }
                withLoading(handleSubmit());
            }}
            onClose={handleClose}
        >
            <ModalHeader title={c('Title').t`Edit display name`} />
            <ModalContent>
                <div className="mb1-5">
                    <div className="text-semibold mb0-25">{c('Label').t`Current display name`}</div>
                    <div className="text-ellipsis">{initialDisplayName}</div>
                </div>
                <InputFieldTwo
                    id="displayName"
                    autoFocus
                    value={model}
                    maxLength={255}
                    error={validator([requiredValidator(model)])}
                    onValue={setModel}
                    label={c('Label').t`New display name`}
                />
            </ModalContent>
            <ModalFooter>
                <Button onClick={handleClose} disabled={submitting}>{c('Action').t`Cancel`}</Button>
                <Button color="norm" type="submit" loading={submitting}>{c('Action').t`Save`}</Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditDisplayNameModal;
