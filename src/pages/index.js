import Head from 'next/head';
import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { OverviewBudget } from 'src/sections/overview/overview-budget';
import { OverviewTotalCustomers } from 'src/sections/overview/overview-total-customers';
import { OverviewTasksProgress } from 'src/sections/overview/overview-tasks-progress';
import { OverviewTotalProfit } from 'src/sections/overview/overview-total-profit';
import { OverviewSales } from 'src/sections/overview/overview-sales';
import { OverviewTraffic } from 'src/sections/overview/overview-traffic';
import invoiceService from 'src/services/invoiceService';
import { useEffect, useState } from 'react';

const Page = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  });
  const fetchData = async () => {
    try {
      const response = await invoiceService.summaryInfo();
      if (response.status == 200) {
        const fetchedData = await response.data;
        setData(fetchedData);
      } else {
        setError('Error fetching data');
      }
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Run once when the component mounts

  return (
    <>
      <Head>
        <title>Resumen</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          {/* Add loading and error handling here */}
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <Grid container spacing={3}>
              <Grid xs={12} sm={6} lg={3}>
                <OverviewBudget
                  // difference={12}
                  positive
                  sx={{ height: '100%' }}
                  value={formatter.format(data.totalToday)}
                />
              </Grid>
              <Grid xs={12} sm={6} lg={3}>
                <OverviewTotalCustomers
                  // difference={16}
                  positive={true}
                  sx={{ height: '100%' }}
                  value= {data.numberOfInvoicesToday}
                />
              </Grid>
              <Grid xs={12} sm={6} lg={3}>
                <OverviewTasksProgress
                  sx={{ height: '100%' }}
                  value={data.percentageTotalMonth.toFixed(2)}
                />
              </Grid>
              <Grid xs={12} sm={6} lg={3}>
                <OverviewTotalProfit
                  sx={{ height: '100%' }}
                  value={formatter.format(data.totalMonth)}
                />
              </Grid>
              <Grid xs={12} lg={8}>
                <OverviewSales
                  chartSeries={[
                    {
                      name: 'Año pasado',
                      data: data.monthlyPricesLastYear
                    },
                    {
                      name: 'Año Actual',
                      data: data.monthlyPrices
                    },
                  ]}
                  sx={{ height: '100%' }}
                />
              </Grid>
              <Grid xs={12} md={6} lg={4}>
                <OverviewTraffic
                  chartSeries={data.percentageProducts}
                  colors={['#bee9e8', '#62b6cb', '#1b4965', '#cae9ff', '#5fa8d3']}
                  labels={['Bloques', 'Adoking', 'Grass M.', 'Enchape', 'Aisladores']}
                  sx={{ height: '100%' }}
                />
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
