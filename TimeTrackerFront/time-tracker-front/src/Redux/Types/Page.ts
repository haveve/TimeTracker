export interface Page {
    first: number,
    after: number,
    search?: string,
    orderfield?: string,
    order?: string,
    filterfield?: string,
    minhours?: number,
    maxhours?: number,
}