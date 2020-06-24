import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'node_modules/ngx-spinner'

@Component({
  selector: 'app-web-search',
  templateUrl: './web-search.component.html',
  styleUrls: ['./web-search.component.css']
})
export class WebSearchComponent implements OnInit {

  webData = {
    organic: []
  };

  numOfPages = 0;
  pageLen = 5;
  currPage = 0;

  constructor(private httpClient: HttpClient,
              private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.webData = JSON.parse(localStorage.getItem('webData'));
    console.log(this.webData);
    this.numOfPages = Math.ceil(this.webData.organic.length / this.pageLen);
  }

  search() {
    /*let query = (<HTMLInputElement>document.querySelector('#search-box')).value;
    // console.log(query);
    this.httpClient.get<any>('https://google-search1.p.rapidapi.com/google-search', {
      headers: {
        "x-rapidapi-host": "google-search1.p.rapidapi.com",
				"x-rapidapi-key": "4be4665fe6mshf206c272d832bfdp126ebajsn2db6a635cf95"
      },
      params: {
        'q': query,
        'hl': 'sr',
        'gl': 'cs'
      }
    })
    .subscribe((data) => {
      console.log(data);
      localStorage.setItem('webData', JSON.stringify(data));
      this.webData = data;
      this.spinner.hide();
    }, (err) => {
      this.webData = {
        organic: []
      };
      this.spinner.hide();
    });*/
    // this.webData = JSON.parse(localStorage.getItem('webData'));
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 3000);
  }

  pageChanged(index) {
    this.currPage = index;
  }

}
