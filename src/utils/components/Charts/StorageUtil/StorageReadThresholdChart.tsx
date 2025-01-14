import React from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import { MILLISECONDS_MULTIPLIER, tickFormat, TICKS_COUNT } from '../utils/utils';

type StorageThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const GIB_IN_BYTES = 1024;

const StorageReadThresholdChart: React.FC<StorageThresholdChartProps> = ({ vmi }) => {
  const { currentTime, duration, timespan } = useDuration();
  const queries = React.useMemo(
    () => getUtilizationQueries({ obj: vmi, duration }),
    [vmi, duration],
  );
  const { ref, width, height } = useResponsiveCharts();

  const [data] = usePrometheusPoll({
    query: queries?.FILESYSTEM_READ_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const storageWriteData = data?.data?.result?.[0]?.values;

  const chartData = storageWriteData?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) / GIB_IN_BYTES };
  });

  return (
    <ComponentReady isReady={!isEmpty(chartData)}>
      <div className="util-threshold-chart" ref={ref}>
        <Chart
          height={height}
          width={width}
          padding={35}
          scale={{ x: 'time', y: 'linear' }}
          domain={{
            x: [currentTime - timespan, currentTime],
          }}
          containerComponent={
            <ChartVoronoiContainer
              labels={({ datum }) => {
                return `Data read: ${xbytes(datum?.y, { iec: true, fixed: 2 })}`;
              }}
              constrainToVisibleArea
            />
          }
        >
          <ChartAxis
            tickFormat={tickFormat(duration, currentTime)}
            tickCount={TICKS_COUNT}
            style={{
              ticks: { stroke: 'transparent' },
            }}
            axisComponent={<></>}
          />
          <ChartGroup>
            <ChartArea
              data={chartData}
              style={{
                data: {
                  stroke: chart_color_blue_300.value,
                },
              }}
            />
          </ChartGroup>
        </Chart>
      </div>
    </ComponentReady>
  );
};

export default StorageReadThresholdChart;
