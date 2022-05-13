import { useEffect } from 'react';
import * as React from 'react';

import { ContextMenu, ContextSeparator } from '@proton/components';

import useActiveShare from '../../../hooks/drive/useActiveShare';
import { useFileUploadInput, useFolderUploadInput } from '../../../store';
import { ContextMenuProps } from '../../FileBrowser/interface';
import { ShareFileButton } from '../ContextMenu/buttons';
import { CreateNewFolderButton, UploadFileButton, UploadFolderButton } from './ContextMenuButtons';

export default function generateFolderContextMenu(shareId: string) {
    return function FolderContextMenuWrapper(props: ContextMenuProps) {
        return <FolderContextMenu shareId={shareId} {...props} />;
    };
}

function FolderContextMenu({
    shareId,
    anchorRef,
    isOpen,
    position,
    open,
    close,
}: ContextMenuProps & {
    shareId: string;
}) {
    useEffect(() => {
        if (position) {
            open();
        }
    }, [position]);

    const { activeFolder } = useActiveShare();
    const {
        inputRef: fileInput,
        handleClick: fileClick,
        handleChange: fileChange,
    } = useFileUploadInput(activeFolder.shareId, activeFolder.linkId);
    const {
        inputRef: folderInput,
        handleClick: folderClick,
        handleChange: folderChange,
    } = useFolderUploadInput(activeFolder.shareId, activeFolder.linkId);

    // ContextMenu is removed from DOM when any action is executed but inputs
    // need to stay rendered so onChange handler can work.
    return (
        <>
            <input multiple type="file" ref={fileInput} className="hidden" onChange={fileChange} />
            <input multiple type="file" ref={folderInput} className="hidden" onChange={folderChange} />
            <ContextMenu isOpen={isOpen} close={close} position={position} anchorRef={anchorRef}>
                <CreateNewFolderButton close={close} />
                <ContextSeparator />
                <UploadFileButton close={close} onClick={fileClick} />
                <UploadFolderButton close={close} onClick={folderClick} />
                <ContextSeparator />
                <ShareFileButton close={close} shareId={shareId} />
            </ContextMenu>
        </>
    );
}
