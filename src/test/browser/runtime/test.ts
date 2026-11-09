import { createRouterTransport } from '@connectrpc/connect';
import { test as baseTest, vi } from 'vitest';

import { OutletService } from '@/shared/gen/ceramics/v1/outlet_pb.js';
import {
  createOutletServiceMock,
  type OutletServiceSpies,
} from '@/shared/gen/ceramics/v1/outlet_test.js';
import { OutletListingService } from '@/shared/gen/ceramics/v1/outlet_listing_pb.js';
import {
  createOutletListingServiceMock,
  type OutletListingServiceSpies,
} from '@/shared/gen/ceramics/v1/outlet_listing_test.js';
import { ProductService } from '@/shared/gen/ceramics/v1/product_pb.js';
import {
  createProductServiceMock,
  type ProductServiceSpies,
} from '@/shared/gen/ceramics/v1/product_test.js';
import { SalesReportService } from '@/shared/gen/ceramics/v1/sales_report_pb.js';
import {
  createSalesReportServiceMock,
  type SalesReportServiceSpies,
} from '@/shared/gen/ceramics/v1/sales_report_test.js';
import { screencastFixture } from './screencast-fixture.js';

interface ApplicationServiceSpies {
  readonly outlet: OutletServiceSpies;
  readonly outletListing: OutletListingServiceSpies;
  readonly product: ProductServiceSpies;
  readonly salesReport: SalesReportServiceSpies;
}

interface BrowserFixtures {
  readonly applicationServices: ApplicationServiceSpies;
  readonly outletService: OutletServiceSpies;
  readonly outletListingService: OutletListingServiceSpies;
  readonly productService: ProductServiceSpies;
  readonly salesReportService: SalesReportServiceSpies;
}

type TestApplication = typeof import('./app-bundle.js');

async function loadTestApplication(): Promise<TestApplication> {
  let application = window.testApplication;
  await vi.waitFor(() => {
    application = window.testApplication;
    if (application === undefined) {
      throw new Error(
        window.testApplicationLoadError ?? 'Prebuilt browser test application has not loaded',
      );
    }
  });
  if (application === undefined) {
    throw new Error('Prebuilt browser test application did not load');
  }
  return application;
}

export const test = baseTest
  .extend<BrowserFixtures>({
    applicationServices: [
      async ({ task: _task }, use) => {
        const outlet = createOutletServiceMock().spies;
        const outletListing = createOutletListingServiceMock().spies;
        const product = createProductServiceMock().spies;
        const salesReport = createSalesReportServiceMock().spies;
        const transport = createRouterTransport((router) => {
          router.service(OutletService, {
            createOutlet: outlet.createOutlet.handler,
            listOutlets: outlet.listOutlets.handler,
            setOutletArchived: outlet.setOutletArchived.handler,
            updateOutlet: outlet.updateOutlet.handler,
          });
          router.service(OutletListingService, {
            listOutletListings: outletListing.listOutletListings.handler,
          });
          router.service(ProductService, {
            createProduct: product.createProduct.handler,
            listProducts: product.listProducts.handler,
            renameProduct: product.renameProduct.handler,
            setProductArchived: product.setProductArchived.handler,
          });
          router.service(SalesReportService, {
            createSalesReport: salesReport.createSalesReport.handler,
            getSalesReport: salesReport.getSalesReport.handler,
            listSalesReports: salesReport.listSalesReports.handler,
          });
        });
        const application = await loadTestApplication();
        application.overrideTransport(transport);
        await use({ outlet, outletListing, product, salesReport });
      },
      { auto: true },
    ],
    outletService: async ({ applicationServices }, use) => {
      await use(applicationServices.outlet);
    },
    outletListingService: async ({ applicationServices }, use) => {
      await use(applicationServices.outletListing);
    },
    productService: async ({ applicationServices }, use) => {
      await use(applicationServices.product);
    },
    salesReportService: async ({ applicationServices }, use) => {
      await use(applicationServices.salesReport);
    },
  })
  .extend('screencast', screencastFixture);
