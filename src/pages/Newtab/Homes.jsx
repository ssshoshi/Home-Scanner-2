import React from 'react';
import Container from '@mui/material/Container';
import { LazyLoadImage, trackWindowScroll } from 'react-lazy-load-image-component';
import Grid from '@mui/material/Grid';
import Hcard from './Card'
import { handleBreakpoints } from '@mui/system';


const Homes = ({ homes, typeValue, searchParam, formValue, scrollPosition }) => {
    console.log(typeValue)
    function search(homes) {
        return homes.filter((home) => {
            return searchParam.some((newItem) => {
                return (
                    home[newItem]
                        .toLowerCase()
                        .indexOf(formValue.toLowerCase()) > -1
                );
            });
        });
    }

    function type(homes) {
        return homes.filter((home) => {
            console.log
            if (typeValue === 'All') {
                return home
            } else if (home.homeType === typeValue) {
                return home
            }

        })
    }


    return (
        <Container sx={{ py: 8 }} maxWidth="xl">
            {/* End hero unit */}
            <Grid container spacing={4}>
                {search(type(homes)).map((home, index) => (
                    < Grid item key={index + home.address} xs={12} sm={6} md={4} >
                        <Hcard scrollPosition={scrollPosition} home={home}></Hcard>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
}

export default trackWindowScroll(Homes);
