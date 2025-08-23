import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {BaseComponent} from '../base.component';
import {DOCUMENT, isPlatformServer} from '@angular/common';
import {RouteEnum} from '../../enums/route.enum';

@Component({
  selector: 'webai-studio-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent extends BaseComponent implements OnInit {

  routeEnum!: RouteEnum;

  constructor(@Inject(DOCUMENT) document: Document,
              @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    super(document)
  }

  override ngOnInit() {
    super.ngOnInit();

    if(isPlatformServer(this.platformId)) {
      return;
    }

    this.determineCurrentActiveRoute(window.location.pathname);

    // @ts-expect-error
    window.navigation?.addEventListener("navigate", (event: any) => {
      this.determineCurrentActiveRoute((new URL(event.destination.url)).pathname);
    });
  }
  
  determineCurrentActiveRoute(pathname: string) {
    const pathParts = pathname.split("/");

    // Get the latest path part
    const latestPathPart = pathParts[pathParts.length - 1];

    switch (latestPathPart) {
      case "translation":
        this.routeEnum = RouteEnum.Translation;
        break;

      default:
        this.routeEnum = RouteEnum.Chat;
        break;
    }
  }

  protected readonly RouteEnum = RouteEnum;
}
