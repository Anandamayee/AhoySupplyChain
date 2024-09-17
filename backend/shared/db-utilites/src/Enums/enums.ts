export enum UserRole {
  FARMER = 'Farmer',
  PROCESSOR = 'Processor',
  TRANSPORTER = 'Transporter',
  RETAILER = 'Retailer',
}

export enum BatchStatus {
  BATCHED = 'batched'
}

export enum HarvestStatus {
  HARVESTED = 'harvested'
}

export enum TeaLeavesStatus {
  WITHERING = 'withering',
  ROLLING = 'rolling',
  FERMENTING = 'fermenting',
  DRYING = 'drying',
  SORTING = 'sorting',
}

export enum TransportStatus {
  STORAGE = 'storage',
  INSTRANSIT = 'inTransit',
  DELIVERED = 'delivered'
}

export enum RetailerStatus {
  RECEIVED = 'received'
}

export enum Quality {
  VIP = 'VIP',
  STANDARD = 'Standard',
}

export enum SOLIDITY_METHODS {
  //farmer
  harvestByFarmer = 'harvestByFarmer',
  getHarvestDetail = 'getHarvestDetail',

  //processor
  batchingHarvestByProcessor = 'batchingHarvestByprocessor',
  getBatchDetails = 'getBatchDetails',

  //transporter
  teaTokenTrackingByTransporter = 'teaTokenTrackingByTransporter',
  getShippingDetail = 'getShippingDetail',
  
  //retailer
  teaPlacedInShelvesByRetailer = 'teaPlacedInShelvesByRetailer',
  
  //consumer
  teaTokenTrackingHistory = 'teaTokenTrackingHistoryFechByConsumer',

  //user
  registerTeaTokenPlayers ='registerTeaTokenPlayers'
}

