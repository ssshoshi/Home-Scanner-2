import React, { useState } from "react";
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { styled, alpha } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';



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
    '& .MuiInputBase-input': {
        placeholder: "Type",
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '20ch',
        },
    },
}));

const IconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const TypeComponent = ({ setState, state }) => (
    <Type key="type1">
        <IconWrapper>
            <ArrowDropDownIcon />
        </IconWrapper>
        <StyledSelect
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Type..."
            inputProps={{ 'aria-label': 'type' }}
        >
            <MenuItem value={'All'}>All</MenuItem>
            <MenuItem value={'SINGLE_FAMILY'}>House</MenuItem>
            <MenuItem value={'CONDO'}>Condo</MenuItem>
        </StyledSelect>
    </Type>
);


export default function useSearch(defaultState) {
    const [state, setState] = useState(defaultState);

    return [
        state,
        <TypeComponent state={state} setState={setState} />,
        setState
    ];
}

