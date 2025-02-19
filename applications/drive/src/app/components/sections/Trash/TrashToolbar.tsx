import { useMemo } from 'react';

import { Vr } from '@proton/atoms';
import { Toolbar } from '@proton/components';

import { DecryptedLink } from '../../../store';
import { useSelection } from '../../FileBrowser';
import { DetailsButton, DownloadButton, LayoutButton, PreviewButton } from '../ToolbarButtons';
import { getSelectedItems } from '../helpers';
import { DeletePermanentlyButton, RestoreFromTrashButton } from './ToolbarButtons';

interface Props {
    items: DecryptedLink[];
}

const TrashToolbar = ({ items }: Props) => {
    const selectionControls = useSelection()!;

    const selectedItems = useMemo(
        () => getSelectedItems(items, selectionControls!.selectedItemIds),
        [items, selectionControls!.selectedItemIds]
    );

    const renderSelectionActions = () => {
        if (!selectedItems.length) {
            return null;
        }

        return (
            <>
                <PreviewButton selectedLinks={selectedItems} />
                <DownloadButton selectedLinks={selectedItems} disabledFolders />
                <Vr />
                <DetailsButton selectedLinks={selectedItems} />
                <Vr />
                <RestoreFromTrashButton selectedLinks={selectedItems} />
                <DeletePermanentlyButton selectedLinks={selectedItems} />
            </>
        );
    };

    return (
        <Toolbar>
            {renderSelectionActions()}
            <span className="mlauto flex">
                <LayoutButton />
            </span>
        </Toolbar>
    );
};

export default TrashToolbar;
