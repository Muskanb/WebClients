import { c } from 'ttag';

import { DialogModal, Href, InnerModal, ModalCloseButton, ModalPropsInjection, QRCode } from '@proton/components';
import { MAIL_APP_NAME } from '@proton/shared/lib/constants';

const ModalGetMobileApp = ({ onClose, ...rest }: Partial<ModalPropsInjection>) => (
    /* TODO Modal refactor */
    /* eslint-disable-next-line deprecation/deprecation */
    <DialogModal intermediate onClose={onClose} {...rest}>
        <ModalCloseButton onClose={onClose} />
        <InnerModal className="modal-content pb2 pt2 text-center">
            <h1 className="mb0-5 text-2xl text-bold">{c('Get started checklist instructions')
                .t`Get the ${MAIL_APP_NAME} mobile app`}</h1>
            <div className="mb2 ">{c('Get started checklist instructions').t`Available on iOS and Android.`}</div>
            <div className=" mb2">
                <QRCode value="https://pm.me/app?type=qr" size={200} />
            </div>
            <div className="mb1">{c('Get started checklist instructions')
                .t`Using your mobile device, scan this QR code or visit`}</div>
            <div className="text-2xl text-bold">
                <Href href="https://pm.me/app">pm.me/app</Href>
            </div>
            <p>{c('Get started checklist instructions').t`Sign into the mobile app to complete the action`}</p>
        </InnerModal>
    </DialogModal>
);

export default ModalGetMobileApp;
