import {AfterViewInit, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {PerformanceMetricEnum} from '../../enums/performance-metric.enum';
import {
  BarController, BarElement,
  Chart,
  ChartConfiguration,
  ChartData,
  ChartEvent,
  ChartOptions,
  ChartType, Legend,
  LinearScale,
  LineController, LineElement, PointElement, Tooltip
} from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation';
import {CategoryScale} from 'chart.js';
import {BaseComponent} from '../base/base.component';
import {DOCUMENT, isPlatformBrowser, isPlatformServer} from '@angular/common';

@Component({
  selector: 'app-execution-performance',
  templateUrl: './execution-performance.component.html',
  standalone: false,
  styleUrl: './execution-performance.component.scss'
})
export class ExecutionPerformanceComponent extends BaseComponent implements OnInit, AfterViewInit {

  sessionCreationStartedAt?: Date;
  sessionCreationEndedAt?: Date;

  sessionCreationStart: number = 0;
  sessionCreationDuration: number = 0;
  sessionCreationEnd: number = 0;

  inferenceStartedAt?: Date;
  inferenceEndedAt?: Date;

  inferenceStart: number = 0;
  inferenceDuration: number = 0;
  inferenceEnd: number = 0;

  chartElement: HTMLCanvasElement | undefined;

  chart: Chart | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    ) {
    super(document);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    const observer = new PerformanceObserver((list, observer) => {
      list.getEntries().forEach(entry => {
        switch (entry.name as PerformanceMetricEnum) {
          case PerformanceMetricEnum.SessionCreationStarted:
            this.sessionCreationStart = entry.startTime;
            this.sessionCreationStartedAt = new Date(performance.timeOrigin + entry.startTime);
            break

          case PerformanceMetricEnum.SessionCreationEnded:
            this.sessionCreationEnd = entry.startTime;
            this.sessionCreationEndedAt = new Date(performance.timeOrigin + entry.startTime);
            break;

          case PerformanceMetricEnum.SessionCreationDuration:
            this.sessionCreationDuration = Math.round(entry.duration);
            break;

          case PerformanceMetricEnum.InferenceStarted:
            this.inferenceStart = entry.startTime;
            this.inferenceStartedAt = new Date(performance.timeOrigin + entry.startTime);
            break

          case PerformanceMetricEnum.InferenceEnded:
            this.inferenceEnd = entry.startTime;
            this.inferenceEndedAt = new Date(performance.timeOrigin + entry.startTime);
            break;

          case PerformanceMetricEnum.InferenceDuration:
            this.inferenceDuration = Math.round(entry.duration);
            break;

          default:
            break;

        }
      })

      this.updateGraph();
    })

    observer.observe({
      entryTypes: ["measure", "mark"],
    })
  }

  ngAfterViewInit() {
    this.initGraph();

    this.updateGraph();
  }

  public initGraph() {
    if(this.chartElement !== undefined || isPlatformServer(this.platformId)) {
      return;
    }

    Chart.register(annotationPlugin);
    Chart.register(Legend);
    Chart.register(Tooltip);
    Chart.register(CategoryScale);
    Chart.register(LinearScale);
    Chart.register(LineController);
    Chart.register(PointElement);
    Chart.register(BarController)
    Chart.register(BarElement);

    this.chartElement = this.document.getElementById("graph") as HTMLCanvasElement;

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

    window.addEventListener('beforeprint', () => {
      document.getElementById("graph-container")!.style.width = "825px";

      // HIDE CHAT BOX ON PRINT
      const liveFrame = document.querySelector("#hubspot-messages-iframe-container > iframe");
      if (liveFrame != null) {
        // @ts-ignore
        liveFrame.style.setProperty("display", "none", "important");
      }
    });
    window.addEventListener('afterprint', () => {
      document.getElementById("graph-container")!.style.width = "auto";

      const liveFrame = document.querySelector("#hubspot-messages-iframe-container > iframe");
      if (liveFrame != null) {
        // @ts-ignore
        liveFrame.style.removeProperty("display");
      }
    });
  }

  public updateGraph() {
    if(!this.chart) {
      return;
    }

    this.chart.options.scales!['x']!.min = 0;
    this.chart.options.scales!['x']!.max = this.inferenceEnd - this.sessionCreationStart;

    this.chart.data.datasets = [
      {
        label: `Session Creation (${this.sessionCreationDuration}ms)`,
        data: this.sessionCreationDataset,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: `Inference (${this.inferenceDuration}ms)`,
        data: this.inferenceDataset,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ];

    this.chart?.update();
  }

  get sessionCreationDataset(): [number, number][] {
    return [[0, this.sessionCreationEnd - this.sessionCreationStart]];
  }

  get inferenceDataset(): [number, number][] {
    return [[this.inferenceStart - this.sessionCreationStart, this.inferenceEnd - this.sessionCreationStart]];
  }

}
