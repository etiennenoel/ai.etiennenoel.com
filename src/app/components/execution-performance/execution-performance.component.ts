import {AfterViewInit, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {PerformanceMetricEnum} from '../../enums/performance-metric.enum';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartEvent,
  ChartOptions,
  ChartType,
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

  sessionCreationDuration: number = 0;

  sessionCreationEndedAt?: Date;

  inferenceStartedAt?: Date;

  inferenceDuration: number = 0;

  inferenceEndedAt?: Date;

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
            this.sessionCreationStartedAt = new Date(performance.timeOrigin + entry.startTime);
            break

          case PerformanceMetricEnum.SessionCreationEnded:
            this.sessionCreationEndedAt = new Date(performance.timeOrigin + entry.startTime);
            break;

          case PerformanceMetricEnum.SessionCreationDuration:
            this.sessionCreationDuration = Math.round(entry.duration);
            break;

          case PerformanceMetricEnum.InferenceStarted:
            this.inferenceStartedAt = new Date(performance.timeOrigin + entry.startTime);
            break

          case PerformanceMetricEnum.InferenceEnded:
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
    Chart.register(Tooltip);
    Chart.register(CategoryScale);
    Chart.register(LinearScale);
    Chart.register(LineController);
    Chart.register(PointElement);
    Chart.register(LineElement);

    this.chartElement = this.document.getElementById("graph") as HTMLCanvasElement;
    this.chart = new Chart(this.chartElement, {
      type: "line",
      data: {
        datasets: [],
      },
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: "Axis Y"
            }
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return (context.raw as any).description
              }
            }
          },
        },
      }
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

    this.chart.data.datasets = [{
      borderColor: '#1C7ED6',
      pointBackgroundColor: "#005098",
      data: [],
    }];

    this.chart.data.datasets = [{
      borderColor: '#1C7ED6',
      pointBackgroundColor: "#005098",
      data: [],
    }];

    this.chart?.update();
  }

}
