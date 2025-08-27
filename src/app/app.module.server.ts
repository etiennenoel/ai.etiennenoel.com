import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { serverRoutes } from './app.routes.server';
import {RootComponent} from './components/root/root.component';
import {provideServerRendering, withRoutes} from '@angular/ssr';

@NgModule({
  imports: [AppModule, ServerModule],
  providers: [provideServerRendering(withRoutes(serverRoutes))],
  bootstrap: [RootComponent],
})
export class AppServerModule {}
