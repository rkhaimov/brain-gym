export interface ReportMailCursor {
  readonly lastScannedUid: number;
  readonly uidValidity: number;
}

export interface ReportMailAttachment {
  readonly filename: string;
  readonly source: Buffer;
  readonly uid: number;
}

export interface ReportMailboxScan {
  readonly attachments: readonly ReportMailAttachment[];
  readonly lastScannedUid: number;
  readonly uidValidity: number;
}

export interface ReportMailbox {
  readonly account: string;
  scan(cursor: ReportMailCursor | undefined): Promise<ReportMailboxScan>;
}
