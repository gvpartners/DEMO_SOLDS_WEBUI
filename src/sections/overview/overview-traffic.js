import PropTypes from 'prop-types';
import ComputerDesktopIcon from '@heroicons/react/24/solid/ComputerDesktopIcon';
import DeviceTabletIcon from '@heroicons/react/24/solid/DeviceTabletIcon';
import PhoneIcon from '@heroicons/react/24/solid/PhoneIcon';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  SvgIcon,
  Typography,
  useTheme
} from '@mui/material';
import { Chart } from 'src/components/chart';
import { red } from '@mui/material/colors';

const useChartOptions = (labels, colors) => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent'
    },
    colors,
    dataLabels: {
      enabled: false
    },
    labels,
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        expandOnClick: false
      }
    },
    states: {
      active: {
        filter: {
          type: 'none'
        }
      },
      hover: {
        filter: {
          type: 'none'
        }
      }
    },
    stroke: {
      width: 0
    },
    theme: {
      mode: theme.palette.mode
    },
    tooltip: {
      fillSeriesColor: false
    }
  };
};

const iconMap = {
  Desktop: (
    <SvgIcon>
      <ComputerDesktopIcon />
    </SvgIcon>
  ),
  Tablet: (
    <SvgIcon>
      <DeviceTabletIcon />
    </SvgIcon>
  ),
  Phone: (
    <SvgIcon>
      <PhoneIcon />
    </SvgIcon>
  )
};

export const OverviewTraffic = (props) => {
  const { chartSeries, labels, colors, sx } = props;
  const chartOptions = useChartOptions(labels, colors);

  return (
    <Card sx={sx}>
      <CardHeader title="PRODUCTOS VENDIDOS DEL MES" />
      <CardContent>
        <Stack
          alignItems="flex-end"
          justifyContent="flex-start"
          sx={{ position: 'relative' }}
        >
          <Stack
            direction="column"
            alignItems="flex-end"
            style={{marginTop:'-15px'}}
            sx={{ position: 'absolute', top: 0, right: 0 }}
          >
            {labels.map((label, index) => (
              <Stack
                key={label}
                direction="row"
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: colors[index],
                    borderRadius: '50%',
                    marginRight: '5px'
                  }}
                />
                <Typography sx={{ fontSize: 12 }}>
                  {label}: {chartSeries[index]}%
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ marginTop: '100px', marginRight: '100px' }}
          >
            <Chart
              height={300}
              options={chartOptions}
              series={chartSeries}
              type="donut"
              width="100%"
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

OverviewTraffic.propTypes = {
  chartSeries: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  colors: PropTypes.array.isRequired,
  sx: PropTypes.object
};
