import React from "react";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { styled, alpha } from '@mui/material/styles';

const TYPES = [
    { value: 'SINGLE_FAMILY', label: 'House' },
    { value: 'CONDO', label: 'Condo' },
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'TOWNHOUSE', label: 'Townhouse' },
    { value: 'MULTI_FAMILY', label: 'Multi-family' },
    { value: 'LOT', label: 'Land' },
    { value: 'MOBILE', label: 'Mobile Home' },
];

const Type = styled(FormControl)(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const StyledSelect = styled(Select)(() => ({
    color: 'inherit',
    minWidth: 120,
}));

const TypeFilter = ({ value, onChange }) => {
    const handleChange = (e) => {
        const val = e.target.value;
        if (val[val.length - 1] === 'All') {
            onChange(['All']);
        } else {
            const filtered = val.filter(v => v !== 'All');
            onChange(filtered.length === 0 ? ['All'] : filtered);
        }
    };

    return (
        <Type variant="standard">
            <StyledSelect
                multiple
                disableUnderline
                sx={{ '.MuiSelect-icon': { color: 'white' } }}
                value={value}
                onChange={handleChange}
                renderValue={(selected) => {
                    if (selected.includes('All')) return 'All Types';
                    return selected.map(v => TYPES.find(t => t.value === v)?.label).join(', ');
                }}
            >
                <MenuItem value="All">
                    <Checkbox checked={value.includes('All')} />
                    <ListItemText primary="All" />
                </MenuItem>
                {TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                        <Checkbox checked={value.includes(type.value)} />
                        <ListItemText primary={type.label} />
                    </MenuItem>
                ))}
            </StyledSelect>
        </Type>
    );
};

export default TypeFilter;
