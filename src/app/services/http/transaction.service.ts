import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private baseUrl: any = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getLearnerInvo(staffId,termId): any {
    return this.http.get(this.baseUrl + 'InvoiceWaitingConfirms/' + staffId+'/'+termId);
  }
  getInvoByLearner(learnerId): any {
    return this.http.get(this.baseUrl + 'InvoiceWaitingConfirms/' + learnerId);
  }
  update(data): any {
    return this.http.put(this.baseUrl + 'InvoiceWaitingConfirms/', data);
  }
  GroupOr121(id, type): any {
    return this.http.get(this.baseUrl + `courseinstance/${id}/${type}`);
  }
}
