import { useAppContext } from '../../context';
import { IconButton, Input } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { ChangeEvent } from 'react';
import { useTranslation } from 'next-i18next';


export default function ProductSearch() {
  const { refinement, setRefinement } = useAppContext();
  const { t } = useTranslation('common');

  const handleChange = (
    { target: { value } }: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setRefinement({
      sort: refinement.sort,
      filters: refinement.filters,
      search: value,
    });
  };

  const handleClear = () => {
    setRefinement({
      sort: refinement.sort,
      filters: refinement.filters,
      search: '',
    });
  };

  return (
    <Input
      value={refinement.search}
      onChange={handleChange}
      startDecorator={<SearchIcon />}
      sx={{ bgcolor: 'background.body' }}
      placeholder={t('home.search.placeholder').toString()}
      aria-label="search"
      endDecorator={
        <IconButton
          disabled={refinement.search.length === 0}
          aria-label="clear-search"
          onClick={handleClear}
          variant="plain"
          color="neutral"
        >
          {refinement.search.length > 0 && <ClearIcon />}
        </IconButton>
      }
    />
  );
}