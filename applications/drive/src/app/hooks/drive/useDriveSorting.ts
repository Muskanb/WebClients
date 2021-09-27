import { useMultiSortedList } from '@proton/components';
import { SortConfig } from '@proton/components/hooks/useSortedList';
import { SORT_DIRECTION } from '@proton/shared/lib/constants';
import { AllSortKeys, DriveSectionSortKeys, LinkMeta, SortParams } from '@proton/shared/lib/interfaces/drive/link';

const getNameSortConfig = (direction = SORT_DIRECTION.ASC) => ({
    key: 'Name' as DriveSectionSortKeys,
    direction,
    compare: (a: LinkMeta['Name'], b: LinkMeta['Name']) => a.localeCompare(b),
});

const getConfig = (sortField: AllSortKeys, direction: SORT_DIRECTION) => {
    const configs: {
        [key in AllSortKeys]: SortConfig<LinkMeta>[];
    } = {
        Name: [{ key: 'Type', direction: SORT_DIRECTION.ASC }, getNameSortConfig(direction)],
        MIMEType: [{ key: 'MIMEType', direction }, { key: 'Type', direction }, getNameSortConfig()],
        ModifyTime: [{ key: 'ModifyTime', direction }, getNameSortConfig()],
        Size: [{ key: 'Type', direction }, { key: 'Size', direction }, getNameSortConfig()],
        CreateTime: [{ key: 'Type', direction }, { key: 'Size', direction }, getNameSortConfig()],
        ExpireTime: [{ key: 'Type', direction }, { key: 'Size', direction }, getNameSortConfig()],
    };
    return configs[sortField];
};

function useDriveSorting<T extends AllSortKeys>(
    getList: (sortParams: SortParams<T>) => LinkMeta[],
    sortParams: SortParams<T>,
    changeSort: (sortParams: SortParams<T>) => Promise<unknown>
) {
    const { sortedList, setConfigs } = useMultiSortedList(
        getList(sortParams),
        getConfig(sortParams.sortField, sortParams.sortOrder)
    );

    const setSorting = async ({ sortField, sortOrder }: SortParams<T>) => {
        setConfigs(getConfig(sortField, sortOrder));
        changeSort({ sortField, sortOrder }).catch(console.error);
    };

    return {
        sortParams,
        sortedList,
        setSorting,
    };
}

export default useDriveSorting;
