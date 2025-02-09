import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {BaseComponent} from '../../components/base/base.component';
import {DOCUMENT} from '@angular/common';
import {RouteEnum} from '../../enums/route.enum';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  standalone: false,
  styleUrl: './index.component.scss'
})
export class IndexComponent extends BaseComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) document: Document,
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
  ) {
    super(document);
  }

}
