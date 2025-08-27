import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  DOCUMENT
} from '@angular/core';
import {PerformanceMetricEnum} from '../../enums/performance-metric.enum';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController, LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation';
import {BaseComponent} from '../base/base.component';
import {isPlatformServer} from '@angular/common';
import {ExecutionPerformanceManager} from '../../managers/execution-performance.manager';
import {ExecutionPerformanceResultModel} from '../../models/execution-performance-result.model';
import {ToastStore} from '../../stores/toast.store';

@Component({
  selector: 'app-execution-performance',
  templateUrl: './execution-performance.component.html',
  standalone: false,
  styleUrl: './execution-performance.component.scss'
})
export class ExecutionPerformanceComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild("chartElement")
  chartElementRef?: ElementRef;

  @ViewChild("chartContainer")
  chartContainerRef?: ElementRef;

  chartElement: HTMLCanvasElement | undefined;

  chart: Chart | undefined;

  @Input()
  executionPerformanceResult?: ExecutionPerformanceResultModel;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly executionPerformanceManager: ExecutionPerformanceManager,
    private readonly toastStore: ToastStore,
  ) {
    super(document);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['executionPerformanceResult']) {
      this.updateGraph();
    }
  }

  override ngOnInit(): void {
    super.ngOnInit();


  }

  ngAfterViewInit() {
    this.initGraph();

    this.updateGraph();
  }

  public initGraph() {
    if (!this.chartElementRef || this.chartElement !== undefined || isPlatformServer(this.platformId)) {
      return;
    }

    Chart.register(annotationPlugin);
    Chart.register(Legend);
    Chart.register(Tooltip);
    Chart.register(CategoryScale);
    Chart.register(LinearScale);
    Chart.register(LineController);
    Chart.register(LineElement);
    Chart.register(PointElement);
    Chart.register(BarController)
    Chart.register(BarElement);

    this.chartElement = this.chartElementRef?.nativeElement as HTMLCanvasElement;
    if (!this.chartElement) {
      console.error("Canvas element with ID 'graph' not found. Chart initialization aborted.");
      return;
    }

    this.chart = new Chart(this.chartElement, {
      type: 'bar',
      data: {
        labels: ['Time'],
        datasets: [],
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        // Elements options apply to all of the options unless overridden in a dataset
        // In this case, we are setting the border of each horizontal bar to be 2px wide
        elements: {
          bar: {
            borderWidth: 2,
          }
        },

        scales: {
          x: {
            min: 0,
          }
        },
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            display: true,
          },
          title: {
            display: true,
            text: 'Model Execution Statistics'
          }
        }
      },
    });
  }

  copyToClipboard(type: "csv" | "table") {
    switch (type) {
      case "csv":
        return;
      case "table":
        navigator.clipboard.writeText(`${this.executionPerformanceResult?.sessionCreationStartedAt?.toISOString()}\t${this.executionPerformanceResult?.getInput()}\t${this.executionPerformanceResult?.api}\t${this.executionPerformanceResult?.sessionCreationDuration}\t${this.executionPerformanceResult?.inferenceDuration}\t${this.timeToFirstToken}`)
        break;
    }

    this.toastStore.publish({
      message: "Result copied to clipboard."
    })
  }

  public updateGraph() {
    if (!this.chart || !this.executionPerformanceResult) {
      return;
    }

    this.chart.options.scales!['x']!.min = 0;
    this.chart.options.scales!['x']!.max = (this.executionPerformanceResult.inferenceEnd - this.executionPerformanceResult.sessionCreationStart) * 1.05;

    const a = this.tokenReceiveDataset;

    this.chart.data.datasets = [
      {
        label: `Session Creation (${this.executionPerformanceResult.sessionCreationDuration}ms)`,
        data: this.sessionCreationDataset,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: `Download (${this.executionPerformanceResult.downloadDuration}ms)`,
        data: this.downloadDataset,
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
      },
      {
        label: `Inference (${this.executionPerformanceResult.inferenceDuration}ms)`,
        data: this.inferenceDataset,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: `Token received`,
        type: 'line',
        data: this.tokenReceiveDataset,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ];

    this.chart?.update();
  }

  get timeToFirstToken(): number {
    if(!this.executionPerformanceResult?.tokensReceived || this.executionPerformanceResult.tokensReceived.length <= 0) {
      return 0;
    }

    return this.executionPerformanceResult.tokensReceived[0] - this.executionPerformanceResult.sessionCreationStart;
  }

  get sessionCreationDataset(): [number, number][] {
    if (!this.executionPerformanceResult) {
      return [];
    }

    return [[0, this.executionPerformanceResult.sessionCreationEnd - this.executionPerformanceResult.sessionCreationStart]];
  }

  get downloadDataset(): [number, number][] {
    if (!this.executionPerformanceResult) {
      return [];
    }

    return [[this.executionPerformanceResult.downloadStart - this.executionPerformanceResult.sessionCreationStart, this.executionPerformanceResult.downloadEnd - this.executionPerformanceResult.sessionCreationStart]];
  }

  get inferenceDataset(): [number, number][] {
    if (!this.executionPerformanceResult) {
      return [];
    }

    return [[this.executionPerformanceResult.inferenceStart - this.executionPerformanceResult.sessionCreationStart, this.executionPerformanceResult.inferenceEnd - this.executionPerformanceResult.sessionCreationStart]];
  }

  get tokenReceiveDataset(): any[] {
    if (!this.executionPerformanceResult || !this.executionPerformanceResult.tokensReceived) {
      return [];
    }

    return this.executionPerformanceResult.tokensReceived.map(value => {
      return {x: value - this.executionPerformanceResult!.sessionCreationStart, y: "Time"}
    });
  }
}
