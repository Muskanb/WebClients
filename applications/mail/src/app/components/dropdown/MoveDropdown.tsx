import { useEffect, useMemo, useState } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import {
    Checkbox,
    FeatureCode,
    FolderIcon,
    Icon,
    IconName,
    Mark,
    PrimaryButton,
    Radio,
    SearchInput,
    Tooltip,
    classnames,
    generateUID,
    useFeature,
    useFolders,
    useLoading,
    useModalState,
} from '@proton/components';
import EditLabelModal from '@proton/components/containers/labels/modals/EditLabelModal';
import { MAILBOX_LABEL_IDS } from '@proton/shared/lib/constants';
import { buildTreeview } from '@proton/shared/lib/helpers/folder';
import { normalize } from '@proton/shared/lib/helpers/string';
import { Folder, FolderWithSubFolders } from '@proton/shared/lib/interfaces/Folder';
import { Message } from '@proton/shared/lib/interfaces/mail/Message';
import isTruthy from '@proton/utils/isTruthy';

import { isMessage as testIsMessage } from '../../helpers/elements';
import { getMessagesAuthorizedToMove } from '../../helpers/message/messages';
import { useCreateFilters } from '../../hooks/actions/useCreateFilters';
import { useMoveToFolder } from '../../hooks/actions/useMoveToFolder';
import { useGetElementsFromIDs } from '../../hooks/mailbox/useElements';
import { Breakpoints } from '../../models/utils';

import './MoveDropdown.scss';

export const moveDropdownContentProps = { className: 'flex flex-column flex-nowrap flex-align-items-stretch' };

type FolderItem = Folder & { icon: IconName; level: number };

const { INBOX, TRASH, SPAM, ARCHIVE } = MAILBOX_LABEL_IDS;

const folderReducer = (acc: FolderItem[], folder: FolderWithSubFolders, level = 0): FolderItem[] => {
    acc.push({
        ...folder,
        Name: folder.Name,
        icon: folder.subfolders?.length ? 'folders' : 'folder',
        level,
    });

    if (Array.isArray(folder.subfolders)) {
        folder.subfolders.forEach((folder: FolderWithSubFolders) => folderReducer(acc, folder, level + 1));
    }

    return acc;
};

interface Props {
    selectedIDs: string[];
    labelID: string;
    conversationMode: boolean;
    onClose: () => void;
    onLock: (lock: boolean) => void;
    onBack: () => void;
    breakpoints: Breakpoints;
}

const MoveDropdown = ({ selectedIDs, labelID, conversationMode, onClose, onLock, onBack, breakpoints }: Props) => {
    const [uid] = useState(generateUID('move-dropdown'));
    const contextFilteringFeature = useFeature(FeatureCode.ContextFiltering);

    const [loading, withLoading] = useLoading();
    const [folders = []] = useFolders();
    const [search, updateSearch] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<Folder | undefined>();
    const [always, setAlways] = useState(false);
    const [containFocus, setContainFocus] = useState(true);
    const normSearch = normalize(search, true);
    const getElementsFromIDs = useGetElementsFromIDs();
    const { moveToFolder, moveScheduledModal, moveAllModal, moveToSpamModal } = useMoveToFolder(setContainFocus);
    const { getSendersToFilter } = useCreateFilters();

    const [editLabelProps, setEditLabelModalOpen] = useModalState();

    useEffect(() => onLock(!containFocus), [containFocus]);

    const treeview = buildTreeview(folders);
    const elements = getElementsFromIDs(selectedIDs);
    const isMessage = testIsMessage(elements[0]);
    const canMoveToInbox = isMessage ? !!getMessagesAuthorizedToMove(elements as Message[], INBOX).length : true;
    const canMoveToSpam = isMessage ? !!getMessagesAuthorizedToMove(elements as Message[], SPAM).length : true;

    const alwaysCheckboxDisabled = useMemo(() => {
        return !getSendersToFilter(elements).length || !selectedFolder;
    }, [getSendersToFilter, elements]);

    const list = treeview
        .reduce<FolderItem[]>((acc, folder) => folderReducer(acc, folder), [])
        .concat([
            canMoveToInbox && {
                ID: INBOX,
                Name: c('Mailbox').t`Inbox`,
                icon: 'inbox',
            },
            { ID: ARCHIVE, Name: c('Mailbox').t`Archive`, icon: 'archive-box' },
            canMoveToSpam && {
                ID: SPAM,
                Name: c('Mailbox').t`Spam`,
                icon: 'fire',
            },
            { ID: TRASH, Name: c('Mailbox').t`Trash`, icon: 'trash' },
        ] as FolderItem[])
        .filter(isTruthy)
        .filter(({ Name = '' }: { Name: string }) => {
            if (!search) {
                return true;
            }
            const normName = normalize(Name, true);
            return normName.includes(normSearch);
        });

    const actualMoveFolder = async (selectedFolderID: string, selectedFolderName: string) => {
        // If the destination folder is SPAM, we don't want to create a filter even if always is checked
        // Senders will be moved to spam anyway, but since we don't want to create filters in the "Spam case",
        // We only need to ignore the value in that scenario
        const canApplyAlways = selectedFolderID !== SPAM;

        await moveToFolder(elements, selectedFolderID, selectedFolderName, labelID, canApplyAlways ? always : false);
        onClose();

        if (!isMessage || !conversationMode) {
            onBack();
        }
    };

    const handleMove = async () => {
        await actualMoveFolder(selectedFolder?.ID || '', selectedFolder?.Name || '');
    };

    const handleApplyDirectly = async (selectedFolderID: string, selectedFolderName: string) => {
        await actualMoveFolder(selectedFolderID, selectedFolderName);
    };

    const handleCreate = () => {
        setContainFocus(false);
        setEditLabelModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await withLoading(handleMove());
    };

    // The dropdown is several times in the view, native html ids has to be different each time
    const searchInputID = `${uid}-search`;
    const alwaysCheckID = `${uid}-always`;
    const folderButtonID = (ID: string) => `${uid}-${ID}`;
    const autoFocusSearch = !breakpoints.isNarrow;
    const applyDisabled = selectedFolder?.ID === undefined;

    return (
        <form
            className="flex flex-column flex-nowrap flex-justify-start flex-align-items-stretch flex-item-fluid-auto"
            onSubmit={handleSubmit}
        >
            <div className="flex flex-item-noshrink flex-justify-space-between flex-align-items-center m1 mb0">
                <span className="text-bold" tabIndex={-2}>
                    {c('Label').t`Move to`}
                </span>
                <Tooltip title={c('Title').t`Create folder`}>
                    <Button
                        icon
                        color="norm"
                        size="small"
                        onClick={handleCreate}
                        className="flex flex-align-items-center"
                        data-testid="folder-dropdown:add-folder"
                        data-prevent-arrow-navigation
                    >
                        <Icon name="folder" /> +
                    </Button>
                </Tooltip>
                <EditLabelModal type="folder" onCloseCustomAction={() => setContainFocus(true)} {...editLabelProps} />
            </div>
            <div className="flex-item-noshrink m1 mb0">
                <SearchInput
                    value={search}
                    onChange={updateSearch}
                    id={searchInputID}
                    placeholder={c('Placeholder').t`Filter folders`}
                    autoFocus={autoFocusSearch}
                    data-testid="folder-dropdown:search-folder"
                    data-prevent-arrow-navigation
                />
            </div>
            <div
                className="overflow-auto mt1 move-dropdown-container flex-item-fluid-auto"
                data-testid="move-dropdown-list"
            >
                <ul className="unstyled mt0 mb0">
                    {list.map((folder: FolderItem) => {
                        return (
                            <li
                                key={folder.ID}
                                className="dropdown-item dropdown-item-button relative cursor-pointer w100 flex flex-nowrap flex-align-items-center pt0-5 pb0-5 pl1 pr1"
                            >
                                <Radio
                                    className="flex-item-noshrink mr0-5"
                                    id={folderButtonID(folder.ID)}
                                    name={uid}
                                    checked={selectedFolder?.ID === folder.ID}
                                    onChange={() => setSelectedFolder(folder)}
                                    data-testid={`label-dropdown:folder-radio-${folder.Name}`}
                                />
                                <label
                                    htmlFor={folderButtonID(folder.ID)}
                                    data-level={folder.level}
                                    className="flex flex-nowrap flex-align-items-center flex-item-fluid"
                                    data-testid={`folder-dropdown:folder-${folder.Name}`}
                                    onClick={() => handleApplyDirectly(folder.ID, folder.Name)}
                                >
                                    <FolderIcon
                                        folder={folder}
                                        name={folder.icon}
                                        className="flex-item-noshrink mr0-5"
                                    />
                                    <span className="text-ellipsis" title={folder.Name}>
                                        <Mark value={search}>{folder.Name}</Mark>
                                    </span>
                                </label>
                            </li>
                        );
                    })}
                    {list.length === 0 && (
                        <li key="empty" className="dropdown-item w100 pt0-5 pb0-5 pl1 pr1">
                            {c('Info').t`No folder found`}
                        </li>
                    )}
                </ul>
            </div>
            {contextFilteringFeature.feature?.Value === true && contextFilteringFeature.loading === false && (
                <>
                    <hr className="m0 flex-item-noshrink" />
                    <div
                        className={classnames([
                            'px1 mt1 flex-item-noshrink',
                            alwaysCheckboxDisabled && 'color-disabled',
                        ])}
                    >
                        <Checkbox
                            id={alwaysCheckID}
                            checked={always}
                            disabled={alwaysCheckboxDisabled}
                            onChange={({ target }) => setAlways(target.checked)}
                            data-testid="move-dropdown:always-move"
                            data-prevent-arrow-navigation
                        >
                            {c('Label').t`Always move sender's emails`}
                        </Checkbox>
                    </div>
                </>
            )}
            <div className="m1 flex-item-noshrink">
                <PrimaryButton
                    className="w100"
                    loading={loading}
                    disabled={applyDisabled}
                    data-testid="move-dropdown:apply"
                    data-prevent-arrow-navigation
                    type="submit"
                >
                    {c('Action').t`Apply`}
                </PrimaryButton>
            </div>
            {moveScheduledModal}
            {moveAllModal}
            {moveToSpamModal}
        </form>
    );
};

export default MoveDropdown;
