

export interface OrderModel {
  pk: string
  seqNo: string
  seqType: string
  seqStatus: string
  seqFk: string
  isDone : string
  errorMessage : string
}

export interface ParcelDetail{
   pk: string
  orderDateTime: string
  plannedStartDate: string
  actulStartDate: string
  orderStatus: string
  siteName: string
  parcelNumber: string
}