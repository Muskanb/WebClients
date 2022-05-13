import { useState, useEffect } from 'react';
import { c } from 'ttag';

import { EmptyViewContainer, useActiveBreakpoint, usePopperAnchor } from '@proton/components';

import noContentSvg from '@proton/styles/assets/img/illustrations/empty-folder.svg';
import { UploadButton } from './UploadButton';
import generateFolderContextMenu from './FolderContextMenu';

const EmptyFolder = ({ shareId }: { shareId: string }) => {
    const { isDesktop } = useActiveBreakpoint();
    const { anchorRef, isOpen, open, close } = usePopperAnchor<HTMLDivElement>();
    const [contextMenuPosition, setContextMenuPosition] = useState<{ top: number; left: number }>();

    useEffect(() => {
        if (!anchorRef.current) {
            return;
        }

        const handleContextMenu = (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();

            if (isOpen) {
                close();
            }

            setContextMenuPosition({ top: ev.clientY, left: ev.clientX });
        };

        anchorRef.current.addEventListener('contextmenu', handleContextMenu);

        return () => {
            anchorRef.current?.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [anchorRef, isOpen, close, setContextMenuPosition]);

    const FolderContextMenu = generateFolderContextMenu(shareId);

    return (
        <>
            <div role="presentation" ref={anchorRef} onClick={close} className="flex w100 flex flex-item-fluid">
                <EmptyViewContainer imageProps={{ src: noContentSvg, title: c('Info').t`There are no files yet` }}>
                    <h3 className="text-bold">{c('Info').t`Secure your documents and data`}</h3>
                    <p>
                        {isDesktop
                            ? c('Info').t`Drag and drop items here or browse for files to upload.`
                            : c('Info').t`Tap the + button to upload a file or folder.`}
                    </p>
                    {isDesktop && (
                        <div className="flex flex-justify-center">
                            <UploadButton className="w13e" />
                        </div>
                    )}
                </EmptyViewContainer>
            </div>
            <FolderContextMenu
                isOpen={isOpen}
                open={open}
                close={close}
                position={contextMenuPosition}
                anchorRef={anchorRef}
            />
        </>
    );
};

export default EmptyFolder;
