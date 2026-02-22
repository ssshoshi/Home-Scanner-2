import React from 'react';
import Container from '@mui/material/Container';
import { LazyLoadImage, trackWindowScroll } from 'react-lazy-load-image-component';
import Grid from '@mui/material/Grid';
import HomeCard from './Card'
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const SkeletonCard = () => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={220} />
        <CardContent sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="40%" />
        </CardContent>
    </Card>
);

const Homes = ({ savedHomes, homes, typeValue, searchParam, formValue, scrollPosition, loading, hasSearched, distanceUnit }) => {
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
            if (typeValue.includes('All')) return true;
            return typeValue.includes(home.homeType);
        });
    }

    const filtered = search(type(homes));

    return (
        <Container sx={{ py: 8 }} maxWidth="xl">
            <Grid container spacing={4} sx={{ mt: 0 }}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Grid item key={i} xs={12} sm={6} md={4}>
                            <SkeletonCard />
                        </Grid>
                    ))
                ) : (
                    filtered.map((home, index) => (
                        <Grid item key={index + home.address} xs={12} sm={6} md={4}>
                            <HomeCard scrollPosition={scrollPosition} home={home} homes={homes} savedHomes={savedHomes} distanceUnit={distanceUnit}></HomeCard>
                        </Grid>
                    ))
                )}
            </Grid>
            {!loading && hasSearched && filtered.length === 0 && (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
                    No results found for this location.
                </Typography>
            )}
        </Container>
    )
}

export default trackWindowScroll(Homes);
