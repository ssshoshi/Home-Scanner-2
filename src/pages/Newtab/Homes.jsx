import React from 'react';
import Container from '@mui/material/Container';
import { trackWindowScroll } from 'react-lazy-load-image-component';
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

const SEARCH_PARAM = ["address"];

const parsePrice = (label) => {
    if (!label || label === '--') return Infinity;
    const s = label.replace(/[$,\s]/g, '').toUpperCase();
    if (s.endsWith('M')) return parseFloat(s) * 1_000_000;
    if (s.endsWith('K')) return parseFloat(s) * 1_000;
    return parseFloat(s) || Infinity;
};

const parseBeds = (beds) => (beds === '--' || beds === undefined ? -1 : parseFloat(beds) || -1);

const comparators = {
    distance: (a, b) => a.distance - b.distance,
    price: (a, b) => parsePrice(a.price) - parsePrice(b.price),
    beds: (a, b) => parseBeds(b.beds) - parseBeds(a.beds),
    area: (a, b) => {
        const aArea = a.area === '--' ? -1 : parseFloat(a.area) || -1;
        const bArea = b.area === '--' ? -1 : parseFloat(b.area) || -1;
        return bArea - aArea;
    },
};

const Homes = ({ homes, typeValue, formValue, scrollPosition, loading, hasSearched, distanceUnit, sortValue, minBeds, maxPrice }) => {
    function search(homes) {
        const query = formValue.toLowerCase();
        return homes.filter((home) =>
            SEARCH_PARAM.some((key) => (home[key] || '').toLowerCase().indexOf(query) > -1)
        );
    }

    function type(homes) {
        return homes.filter((home) => {
            if (typeValue.includes('All')) return true;
            return typeValue.includes(home.homeType);
        });
    }

    function filterBeds(homes) {
        if (minBeds === 0) return homes;
        return homes.filter((home) => parseBeds(home.beds) >= minBeds);
    }

    function filterPrice(homes) {
        if (maxPrice === -1) return homes;
        return homes.filter((home) => parsePrice(home.price) <= maxPrice);
    }

    const filtered = search(type(filterBeds(filterPrice(homes))));
    const sorted = [...filtered].sort(comparators[sortValue] || comparators.distance);

    return (
        <Container sx={{ pt: 15, pb: 8 }} maxWidth="xl">
            <Grid container spacing={4} sx={{ mt: 0 }}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Grid item key={i} xs={12} sm={6} md={4}>
                            <SkeletonCard />
                        </Grid>
                    ))
                ) : (
                    sorted.map((home, index) => (
                        <Grid item key={home.zpid || home.buildingId || index} xs={12} sm={6} md={4}>
                            <HomeCard scrollPosition={scrollPosition} home={home} distanceUnit={distanceUnit}></HomeCard>
                        </Grid>
                    ))
                )}
            </Grid>
            {!loading && hasSearched && sorted.length === 0 && (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
                    No results found for this location.
                </Typography>
            )}
        </Container>
    )
}

export default trackWindowScroll(Homes);
