import React, { useState } from "react";
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

const StyledSelect = styled(Select)(({ theme }) => ({
    color: 'inherit',
    minWidth: 120,
}));

const TypeComponent = ({ setState, state }) => {
    const handleChange = (e) => {
        const value = e.target.value;
        if (value[value.length - 1] === 'All') {
            setState(['All']);
        } else {
            const filtered = value.filter(v => v !== 'All');
            setState(filtered.length === 0 ? ['All'] : filtered);
        }
    };

    return (
        <Type variant="standard">
            <StyledSelect
                multiple
                disableUnderline
                sx={{ '.MuiSelect-icon': { color: 'white' } }}
                value={state}
                onChange={handleChange}
                renderValue={(selected) => {
                    if (selected.includes('All')) return 'All Types';
                    return selected.map(v => TYPES.find(t => t.value === v)?.label).join(', ');
                }}
            >
                <MenuItem value="All">
                    <Checkbox checked={state.includes('All')} />
                    <ListItemText primary="All" />
                </MenuItem>
                {TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                        <Checkbox checked={state.includes(type.value)} />
                        <ListItemText primary={type.label} />
                    </MenuItem>
                ))}
            </StyledSelect>
        </Type>
    );
};

export default function useType(defaultState) {
    const [state, setState] = useState(defaultState);
    return [
        state,
        <TypeComponent state={state} setState={setState} />,
        setState
    ];
}
