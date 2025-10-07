import React, { useState, useEffect } from "react";
import { Table } from "../../ui/Table";
import { SearchIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  searchContractingAuthorities,
  setSearchQuery,
  setCurrentPage,
  selectContractingAuthorities,
  selectContractingAuthoritiesLoading,
  selectContractingAuthoritiesError,
  selectContractingAuthoritiesTotal,
  selectContractingAuthoritiesCurrentPage,
  selectContractingAuthoritiesItemsPerPage,
  selectContractingAuthoritiesSearchQuery,
  type ContractingAuthority,
} from "../../../store/slices/contractingAuthoritiesSlice";

export function AuthoritiesSearch() {
  const dispatch = useAppDispatch();

  // Redux state
  const authorities = useAppSelector(selectContractingAuthorities);
  const loading = useAppSelector(selectContractingAuthoritiesLoading);
  const error = useAppSelector(selectContractingAuthoritiesError);
  const total = useAppSelector(selectContractingAuthoritiesTotal);
  const currentPage = useAppSelector(selectContractingAuthoritiesCurrentPage);
  const itemsPerPage = useAppSelector(selectContractingAuthoritiesItemsPerPage);
  const searchQuery = useAppSelector(selectContractingAuthoritiesSearchQuery);

  // Only search when there's a search query, don't load all authorities by default
  useEffect(() => {
    if (searchQuery.trim()) {
      dispatch(
        searchContractingAuthorities({
          searchTerm: searchQuery.trim(),
          limit: itemsPerPage,
          page: currentPage,
        })
      );
    }
  }, [dispatch, currentPage, itemsPerPage, searchQuery]);

  // Debounced search - reset to page 1 when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        dispatch(setCurrentPage(1));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  // Search-only columns (only name)
  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (row: ContractingAuthority) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Search Contracting Authorities
        </h1>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search authorities by name, country, type, contact person, or email..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        
        {!searchQuery.trim() ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Start searching</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter a search term to find contracting authorities.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
            <div className="text-red-800">{error}</div>
          </div>
        ) : authorities.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No authorities match your search criteria. Try a different search term.
              </p>
            </div>
          </div>
        ) : (
          <>
            <Table columns={columns} data={authorities} />
            {total > itemsPerPage && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-center">
                  <p className="text-sm text-gray-700">
                    Showing {authorities.length} of {total} results for "{searchQuery}"
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}