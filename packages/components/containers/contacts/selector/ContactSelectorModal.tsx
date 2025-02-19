import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

import { c, msgid } from 'ttag';

import { Button } from '@proton/atoms';
import { toMap } from '@proton/shared/lib/helpers/object';
import { normalize } from '@proton/shared/lib/helpers/string';
import { Recipient } from '@proton/shared/lib/interfaces/Address';
import { ContactEmail } from '@proton/shared/lib/interfaces/contacts/Contact';

import {
    Checkbox,
    Form,
    ModalProps,
    ModalTwo,
    ModalTwoContent,
    ModalTwoFooter,
    ModalTwoHeader,
    SearchInput,
} from '../../../components';
import { classnames } from '../../../helpers';
import { useActiveBreakpoint, useContactEmailsSortedByName, useUserSettings } from '../../../hooks';
import { useContactGroups } from '../../../hooks/useCategories';
import { ContactEditProps } from '../edit/ContactEditModal';
import ContactSelectorEmptyContacts from './ContactSelectorEmptyContacts';
import ContactSelectorEmptyResults from './ContactSelectorEmptyResults';
import ContactSelectorList from './ContactSelectorList';
import ContactSelectorRow from './ContactSelectorRow';

import './ContactSelectorModal.scss';

const convertContactToRecipient = ({ Name, ContactID, Email }: ContactEmail) => ({
    Name,
    ContactID,
    Address: Email,
});

export interface ContactSelectorProps {
    inputValue: any;
    onGroupDetails: (contactGroupID: string) => void;
    onEdit: (props: ContactEditProps) => void;
}

interface ContactSelectorResolver {
    onResolve: (recipients: Recipient[]) => void;
    onReject: () => void;
}

type Props = ContactSelectorProps & ContactSelectorResolver & ModalProps;

const ContactSelectorModal = ({ onResolve, onReject, inputValue, onGroupDetails, onEdit, ...rest }: Props) => {
    const { isNarrow } = useActiveBreakpoint();

    const searchInputRef = useRef<HTMLInputElement>(null);
    const [contactEmails, loadingContactEmails] = useContactEmailsSortedByName();
    const [userSettings, loadingUserSettings] = useUserSettings();
    const [contactGroups = [], loadingContactGroups] = useContactGroups();

    const emailsFromInput = inputValue.map((e: any) => e.Address);
    const contactGroupsMap = toMap(contactGroups);

    const initialCheckedContactEmailsMap = contactEmails.reduce(
        (acc: { [key: string]: boolean }, contactEmail: ContactEmail) => {
            acc[contactEmail.ID] = emailsFromInput.includes(contactEmail.Email);
            return acc;
        },
        Object.create(null)
    );

    const [searchValue, setSearchValue] = useState('');
    const [lastCheckedID, setLastCheckedID] = useState('');
    const [isAllChecked, setIsAllChecked] = useState(false);

    const [filteredContactEmails, setFilteredContactEmails] = useState(contactEmails);
    const [checkedContactEmailMap, setCheckedContactEmailMap] = useState<{ [key: string]: boolean }>(
        initialCheckedContactEmailsMap
    );
    const [checkedContactEmails, setCheckedContactEmails] = useState<ContactEmail[]>([]);
    const totalChecked = checkedContactEmails.length;

    const loading = loadingContactEmails || loadingUserSettings || loadingContactGroups;

    const toggleCheckAll = (checked: boolean) => {
        const update = filteredContactEmails.reduce((acc: { [key: string]: boolean }, contactEmail: ContactEmail) => {
            acc[contactEmail.ID] = checked;
            return acc;
        }, Object.create(null));

        setCheckedContactEmailMap({ ...checkedContactEmailMap, ...update });
    };

    const onCheck = (checkedIDs: string[] = [], checked = false) => {
        const update = checkedIDs.reduce((acc, checkedID) => {
            acc[checkedID] = checked;
            return acc;
        }, Object.create(null));

        setCheckedContactEmailMap({ ...checkedContactEmailMap, ...update });
    };

    const handleCheckAll = (e: ChangeEvent<HTMLInputElement>) => toggleCheckAll(e.target.checked);

    const handleCheck = (e: ChangeEvent<HTMLInputElement>, checkedID: string) => {
        const {
            target,
            nativeEvent,
        }: {
            target: EventTarget & HTMLInputElement;
            nativeEvent: Event & { shiftKey?: boolean };
        } = e;
        const checkedIDs = checkedID ? [checkedID] : [];

        if (lastCheckedID && nativeEvent.shiftKey) {
            const start = filteredContactEmails.findIndex((c: ContactEmail) => c.ID === checkedID);
            const end = filteredContactEmails.findIndex((c: ContactEmail) => c.ID === lastCheckedID);
            checkedIDs.push(
                ...filteredContactEmails
                    .slice(Math.min(start, end), Math.max(start, end) + 1)
                    .map((c: ContactEmail) => c.ID)
            );
        }

        if (checkedID) {
            setLastCheckedID(checkedID);
            onCheck(checkedIDs, target.checked);
        }
    };

    const handleClearSearch = () => {
        setSearchValue('');
        searchInputRef?.current?.focus();
    };

    const searchFilter = (c: ContactEmail) => {
        const tokenizedQuery = normalize(searchValue, true).split(' ');

        const groupNameTokens = c.LabelIDs.reduce((acc: string[], labelId) => {
            const tokenized = normalize(contactGroupsMap[labelId].Name, true).split(' ');
            return [...acc, ...tokenized];
        }, []);

        return (
            tokenizedQuery.some((token) => normalize(c.Name, true).includes(token)) ||
            tokenizedQuery.some((token) => normalize(c.Email, true).includes(token)) ||
            tokenizedQuery.some((token) => groupNameTokens.some((g) => g.includes(token)))
        );
    };

    useEffect(() => {
        searchInputRef?.current?.focus();
    }, []);

    useEffect(() => {
        setLastCheckedID('');
        setFilteredContactEmails(contactEmails.filter(searchFilter));
    }, [searchValue]);

    useEffect(() => {
        setCheckedContactEmails(contactEmails.filter((c: ContactEmail) => !!checkedContactEmailMap[c.ID]));
    }, [checkedContactEmailMap]);

    useEffect(() => {
        setIsAllChecked(
            !!filteredContactEmails.length &&
                filteredContactEmails.every((c: ContactEmail) => !!checkedContactEmailMap[c.ID])
        );
    }, [filteredContactEmails, checkedContactEmailMap]);

    const handleSearchValue = (value: string) => setSearchValue(value);

    const handleSubmit = (event: FormEvent) => {
        event.stopPropagation();
        event.preventDefault();

        onResolve(checkedContactEmails.map(convertContactToRecipient));
        rest.onClose?.();
    };

    const actionText =
        totalChecked === 1
            ? c('Action').t`Insert contact`
            : c('Action').ngettext(
                  msgid`Insert ${totalChecked} contact`,
                  `Insert ${totalChecked} contacts`,
                  totalChecked
              );

    return (
        <ModalTwo size="large" as={Form} onSubmit={handleSubmit} data-testid="modal:contactlist" {...rest}>
            <ModalTwoHeader title={c('Title').t`Insert contacts`} />
            <ModalTwoContent>
                {!contactEmails.length ? (
                    <ContactSelectorEmptyContacts onClose={rest.onClose} onEdit={onEdit} />
                ) : (
                    <>
                        <div className="mb0-5">
                            <SearchInput
                                ref={searchInputRef}
                                value={searchValue}
                                onChange={handleSearchValue}
                                placeholder={c('Placeholder').t`Search name, email or group`}
                            />
                        </div>
                        {filteredContactEmails.length ? (
                            <>
                                {!isNarrow && (
                                    <div className="flex flex-nowrap flex-item-fluid contact-list-row p1">
                                        <div>
                                            <Checkbox
                                                className="w100 h100"
                                                checked={isAllChecked}
                                                onChange={handleCheckAll}
                                            />
                                        </div>
                                        <div className="flex flex-item-fluid flex-align-self-center">
                                            <div className="w33 pl1">
                                                <strong className="text-uppercase">{c('Label').t`Name`}</strong>
                                            </div>
                                            <div className="flex-item-fluid">
                                                <strong className="text-uppercase">{c('Label').t`Email`}</strong>
                                            </div>
                                            <div className="w33 pr0-5 text-right">
                                                <strong className="text-uppercase">{c('Label').t`Group`}</strong>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <ContactSelectorList
                                    rowCount={filteredContactEmails.length}
                                    userSettings={userSettings}
                                    className={classnames([isNarrow && 'mt1'])}
                                    rowRenderer={({ index, style }) => (
                                        <ContactSelectorRow
                                            onCheck={handleCheck}
                                            style={style}
                                            key={filteredContactEmails[index].ID}
                                            contact={filteredContactEmails[index]}
                                            checked={!!checkedContactEmailMap[filteredContactEmails[index].ID]}
                                            contactGroupsMap={contactGroupsMap}
                                            isNarrow={isNarrow}
                                            onGroupDetails={onGroupDetails}
                                        />
                                    )}
                                />
                            </>
                        ) : (
                            <ContactSelectorEmptyResults onClearSearch={handleClearSearch} query={searchValue} />
                        )}
                    </>
                )}
            </ModalTwoContent>
            <ModalTwoFooter>
                <Button type="button" onClick={rest.onClose} disabled={loading}>
                    {c('Action').t`Cancel`}
                </Button>
                {contactEmails.length ? (
                    <Button color="norm" loading={loading} type="submit" disabled={!totalChecked}>
                        {actionText}
                    </Button>
                ) : null}
            </ModalTwoFooter>
        </ModalTwo>
    );
};

export default ContactSelectorModal;
