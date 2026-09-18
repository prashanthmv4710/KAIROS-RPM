import * as React from 'react';

import { Grid, GridColumn } from '../../components/Grid';
import { SelectCard } from '../../components/SelectCard';
import { Heading } from '../../components/Text';
import './OrderStatusMetrics.css';

export interface OrderStatusMetric {
  value: string;
  label: string;
  count: number;
}

export interface OrderStatusMetricsProps {
  metrics: OrderStatusMetric[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  'aria-label': string;
}

/**
 * Three status-count cards where exactly one is selected at a time, ported
 * from the Kairos REX Director reference app's inbox section picker: a real
 * `SelectCard singleSelect` (Radio under the hood) restyled into the
 * "Kairos Warehouse Metrics" KPI-tile look via OrderStatusMetrics.css,
 * rather than a hand-rolled radiogroup — the whole card is the toggle
 * target and keyboard/screen-reader selection comes for free.
 */
export function OrderStatusMetrics({
  metrics,
  value,
  onChange,
  name,
  'aria-label': ariaLabel,
}: OrderStatusMetricsProps) {
  return (
    <div role="radiogroup" aria-label={ariaLabel}>
      <Grid hasGutter>
        {metrics.map((metric) => (
          <GridColumn key={metric.value} sm={12} md={4} lg={4}>
            <div className={`rpm-metric-card-wrap${value === metric.value ? ' is-selected' : ''}`}>
              <SelectCard
                singleSelect
                name={name}
                value={metric.value}
                checked={value === metric.value}
                onChange={() => onChange(metric.value)}
                label={metric.label}
              >
                <Heading as="div" size="large">
                  {metric.count}
                </Heading>
              </SelectCard>
            </div>
          </GridColumn>
        ))}
      </Grid>
    </div>
  );
}
