import { Component, OnInit } from '@angular/core';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css']
})
export class DescriptionComponent implements OnInit {

  pdfUrl: string;

  constructor() { }

  ngOnInit(): void {
    this.pdfUrl = `${environment.apiUrl}/download`;
  }

}
