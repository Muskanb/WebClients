import { FormEvent, useState } from 'react';

import { c } from 'ttag';

import { renameSecurityKey } from '@proton/shared/lib/api/settings';
import { requiredValidator } from '@proton/shared/lib/helpers/formValidators';

import {
    Button,
    Form,
    InputFieldTwo,
    ModalTwo as Modal,
    ModalTwoContent as ModalContent,
    ModalTwoFooter as ModalFooter,
    ModalTwoHeader as ModalHeader,
    ModalProps,
    useFormErrors,
} from '../../../components';
import { useApi, useErrorHandler, useEventManager, useLoading, useNotifications } from '../../../hooks';

interface Props extends ModalProps {
    id: string;
    name: string;
}

const EditSecurityKeyModal = ({ id, name, onClose, ...rest }: Props) => {
    const [loading, withLoading] = useLoading();
    const normalApi = useApi();
    const errorHandler = useErrorHandler();
    const silentApi = <T,>(config: any) => normalApi<T>({ ...config, silence: true });
    const { call } = useEventManager();
    const { validator, onFormSubmit } = useFormErrors();
    const [newName, setNewName] = useState(name);
    const { createNotification } = useNotifications();

    const handleUpdate = () => {
        const run = async () => {
            try {
                await silentApi(renameSecurityKey(id, { Name: newName }));
                await call();
                createNotification({
                    text: c('Action').t`${name} updated`,
                });
                onClose?.();
            } catch (e) {
                errorHandler(e);
                return;
            }
        };
        withLoading(run());
    };

    return (
        <Modal
            as={Form}
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
                if (!onFormSubmit(event.currentTarget)) {
                    return;
                }
                handleUpdate();
            }}
            onClose={onClose}
            size="small"
            {...rest}
        >
            <ModalHeader title={c('fido2: Title').t`Name your security key`} />
            <ModalContent>
                <InputFieldTwo
                    autoFocus
                    label={c('fido2: Label').t`Key name`}
                    error={validator([requiredValidator(name)])}
                    value={newName}
                    onValue={setNewName}
                />
            </ModalContent>
            <ModalFooter>
                <Button onClick={onClose} disabled={loading}>
                    {c('Action').t`Cancel`}
                </Button>
                <Button loading={loading} type="submit" color="norm">
                    {c('Action').t`Save`}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditSecurityKeyModal;
