import { memo, useEffect } from 'react';

import {
    Button,
    Icon,
    TableRow,
    Checkbox,
    useActiveBreakpoint,
    classnames,
    DragMoveContainer,
    FileIcon,
    TableCell,
} from '@proton/components';
import { isEquivalent, pick } from '@proton/shared/lib/helpers/object';
import { shallowEqual } from '@proton/utils/array';
import { c } from 'ttag';

import { useThumbnailsDownload } from '../../../store';
import { formatAccessCount } from '../../../utils/formatters';
import SignatureIcon from '../../SignatureIcon';
import { ItemProps } from '../interface';
import useFileBrowserItem from '../useFileBrowserItem';
import CopyLinkIcon from '../CopyLinkIcon';
import LocationCell from './Cells/LocationCell';
import TimeCell from './Cells/TimeCell';
import SizeCell from './Cells/SizeCell';
import NameCell from './Cells/NameCell';

const ItemRow = ({
    item,
    style,
    shareId,
    selectedItems,
    onToggleSelect,
    onClick,
    onShiftClick,
    columns,
    selectItem,
    dragMoveControls,
    isPreview,
    ItemContextMenu,
}: ItemProps) => {
    const {
        isFolder,
        dragMove: { DragMoveContent, dragging },
        dragMoveItems,
        moveText,
        iconText,
        isSelected,
        contextMenu,
        contextMenuPosition,
        draggable,
        itemHandlers,
        checkboxHandlers,
        checkboxWrapperHandlers,
        optionsHandlers,
    } = useFileBrowserItem<HTMLTableRowElement>({
        item,
        onToggleSelect,
        selectItem,
        selectedItems,
        dragMoveControls,
        onClick,
        onShiftClick,
    });

    const { isDesktop } = useActiveBreakpoint();
    const { addToDownloadQueue } = useThumbnailsDownload();

    useEffect(() => {
        if (item.hasThumbnail) {
            addToDownloadQueue(shareId, item.linkId, item.activeRevision?.id);
        }
    }, [item.activeRevision?.id, item.hasThumbnail]);

    const generateExpiresCell = () => {
        const expiredPart = isDesktop ? (
            <span className="ml0-25">{c('Label').t`(Expired)`}</span>
        ) : (
            <span>{c('Label').t`Expired`}</span>
        );

        return (
            item.shareUrl &&
            (item.shareUrl.expireTime ? (
                <div className="flex flex-nowrap">
                    {(isDesktop || !item.shareUrl.isExpired) && <TimeCell time={item.shareUrl.expireTime} />}
                    {item.shareUrl.isExpired ? expiredPart : null}
                </div>
            ) : (
                c('Label').t`Never`
            ))
        );
    };

    return (
        <>
            {draggable && dragMoveControls && (
                <DragMoveContent dragging={dragging} data={dragMoveItems}>
                    <DragMoveContainer>{moveText}</DragMoveContainer>
                </DragMoveContent>
            )}
            <TableRow
                style={style}
                draggable={draggable}
                tabIndex={0}
                role="button"
                ref={contextMenu.anchorRef}
                aria-disabled={item.isLocked}
                className={classnames([
                    'file-browser-list-item flex user-select-none opacity-on-hover-container',
                    (isSelected || dragMoveControls?.isActiveDropTarget || item.isLocked) && 'bg-strong',
                    (dragging || item.isLocked) && 'opacity-50',
                ])}
                data-testid={isSelected ? 'selected' : undefined}
                {...itemHandlers}
            >
                <TableCell className="m0 flex" data-testid="column-checkbox">
                    <div
                        role="presentation"
                        className={classnames([
                            'flex flex-align-items-center',
                            selectedItems.length ? null : 'opacity-on-hover-only-desktop',
                        ])}
                        {...checkboxWrapperHandlers}
                    >
                        <Checkbox
                            disabled={item.isLocked}
                            className="increase-click-surface"
                            checked={isSelected}
                            {...checkboxHandlers}
                        />
                    </div>
                </TableCell>

                <TableCell
                    className="m0 flex flex-align-items-center flex-nowrap flex-item-fluid"
                    data-testid="column-name"
                >
                    {item.cachedThumbnailUrl ? (
                        <img
                            src={item.cachedThumbnailUrl}
                            alt={iconText}
                            className="file-browser-list-item--thumbnail flex-item-noshrink mr0-5"
                        />
                    ) : (
                        <FileIcon mimeType={item.isFile ? item.mimeType : 'Folder'} alt={iconText} className="mr0-5" />
                    )}
                    <SignatureIcon item={item} className="mr0-5 flex-item-noshrink" />
                    <NameCell name={item.name} />
                </TableCell>

                {columns.includes('location') && (
                    <TableCell className={classnames(['m0', isDesktop ? 'w20' : 'w25'])} data-testid="column-location">
                        <LocationCell shareId={shareId} parentLinkId={item.parentLinkId} isTrashed={!!item.trashed} />
                    </TableCell>
                )}

                {columns.includes('original_location') && (
                    <TableCell className={classnames(['m0', isDesktop ? 'w20' : 'w25'])} data-testid="column-location">
                        <LocationCell shareId={shareId} parentLinkId={item.parentLinkId} />
                    </TableCell>
                )}

                {columns.includes('uploaded') && (
                    <TableCell className="m0 w15" data-testid="column-uploaded">
                        <TimeCell time={item.createTime} />
                    </TableCell>
                )}

                {columns.includes('modified') && (
                    <TableCell className="m0 w15" data-testid="column-modified">
                        <TimeCell time={item.fileModifyTime} />
                    </TableCell>
                )}

                {columns.includes('trashed') && (
                    <TableCell className="m0 w25" data-testid="column-trashed">
                        <TimeCell time={item.trashed || item.fileModifyTime} />
                    </TableCell>
                )}

                {columns.includes('share_created') && (
                    <TableCell className="m0 w15" data-testid="column-share-created">
                        {item.shareUrl?.createTime && <TimeCell time={item.shareUrl.createTime} />}
                    </TableCell>
                )}

                {columns.includes('share_num_access') && (
                    <TableCell className="m0 w15" data-testid="column-num-accesses">
                        {formatAccessCount(item.shareUrl?.numAccesses)}
                    </TableCell>
                )}

                {columns.includes('share_expires') && (
                    <TableCell className="m0 w20" data-testid="column-share-expires">
                        {generateExpiresCell()}
                    </TableCell>
                )}

                {columns.includes('size') && (
                    <TableCell className={classnames(['m0', isDesktop ? 'w10' : 'w15'])} data-testid="column-size">
                        {isFolder ? '-' : <SizeCell size={item.size} />}
                    </TableCell>
                )}

                {columns.includes('share_options') && (
                    <TableCell
                        className="m0 file-browser-list--icon-column flex flex-align-items-center"
                        data-testid="column-share-options"
                    >
                        <CopyLinkIcon shareId={shareId} item={item} />
                    </TableCell>
                )}

                <TableCell
                    className="m0 file-browser-list--icon-column flex flex-align-items-center"
                    data-testid="column-options"
                >
                    <Button
                        shape="ghost"
                        size="small"
                        icon
                        className={contextMenu.isOpen ? 'file-browser--options-focus' : 'opacity-on-hover-only-desktop'}
                        {...optionsHandlers}
                    >
                        <Icon name="three-dots-vertical" alt={c('Action').t`More options`} />
                    </Button>
                </TableCell>
            </TableRow>
            {!isPreview && !item.isLocked && ItemContextMenu && (
                <ItemContextMenu position={contextMenuPosition} {...contextMenu} />
            )}
        </>
    );
};

export default memo(ItemRow, (a, b) => {
    if (isEquivalent(a, b)) {
        return true;
    }

    const cheapPropsToCheck: (keyof ItemProps)[] = ['shareId', 'style', 'onToggleSelect', 'onShiftClick', 'onClick'];
    const cheapPropsEqual = isEquivalent(pick(a, cheapPropsToCheck), pick(b, cheapPropsToCheck));

    if (
        !cheapPropsEqual ||
        !isEquivalent(a.item, b.item) ||
        !shallowEqual(a.selectedItems, b.selectedItems) ||
        !shallowEqual(a.columns, b.columns)
    ) {
        return false;
    }

    const dragControlsEqual =
        a.dragMoveControls?.dragging === b.dragMoveControls?.dragging &&
        a.dragMoveControls?.isActiveDropTarget === b.dragMoveControls?.isActiveDropTarget;

    return dragControlsEqual;
});
