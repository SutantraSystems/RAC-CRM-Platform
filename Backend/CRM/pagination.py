from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
import math

# Paginating API responses with additional metadata such as total count, current page, page size, and total pages.
class StandardPagination(PageNumberPagination):

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 400

    def get_paginated_response(self, data):

        page_size = self.get_page_size(self.request)

        return Response({
            "total": self.page.paginator.count,
            "page": self.page.number,
            "page_size": page_size,
            "total_pages": (
                math.ceil(
                    self.page.paginator.count / page_size
                )
                if self.page.paginator.count > 0
                else 1
            ),
            "data": data
        })