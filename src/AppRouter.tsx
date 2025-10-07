import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "./components/layout/Layout";
import { Panel } from "./components/pages/Panel";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import {
  loadUserFromStorage,
  selectIsAuthenticated,
} from "./store/slices/authSlice";
import {
  NotificationsSearch,
  NotificationsAll,
} from "./components/pages/Notifications";
import {
  AddTender,
  EditTender,
  Authorities,
  AuthoritiesSearch,
  Countries,
  NotificationTypes,
  Procedures,
  ContractTypes,
  Categories,
  SubCategories,
} from "./components/pages/Admin";
import {
  AllSubscribers,
  ActiveSubscribers,
  ApproveSubscriber,
  ExpiredSubscribers,
  CompanySubscribers,
  SuspendedSubscribers,
  Passwords,
  ReferredBy,
} from "./components/pages/Subscribers";
import {
  SendEmailQendrimi,
  SendEmail,
  SendWeeklyEmail,
  SendDelayEmail,
  SendPassword,
} from "./components/pages/Email";
import {
  QendrimiTenders,
  BliniTenders,
  TinaTenders,
} from "./components/pages/Tenders";
import { GenerateInvoice } from "./components/pages/Invoices";
import { LogoutPage } from "./components/pages/LogoutPage";
import { Login } from "./components/pages/Login";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
export function AppRouter() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Initialize authentication state on app start
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Root redirect - this will be caught by ProtectedRoute if not authenticated */}
        <Route
          index
          element={
            <ProtectedRoute>
              <Navigate to="/panel" replace />
            </ProtectedRoute>
          }
        />

        {/* Protected routes with layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="panel" element={<Panel />} />
          <Route path="notifications">
            <Route path="search" element={<NotificationsSearch />} />
            <Route path="all" element={<NotificationsAll />} />
          </Route>
          <Route path="admin">
            <Route path="add-tender" element={<AddTender />} />
            <Route path="edit-tender/:id" element={<EditTender />} />
            <Route path="authorities" element={<Authorities />} />
            <Route path="authorities-search" element={<AuthoritiesSearch />} />
            <Route path="countries" element={<Countries />} />
            <Route path="notification-types" element={<NotificationTypes />} />
            <Route path="procedures" element={<Procedures />} />
            <Route path="contract-types" element={<ContractTypes />} />
            <Route path="categories" element={<Categories />} />
            <Route path="sub-categories" element={<SubCategories />} />
          </Route>
          <Route path="subscribers">
            <Route path="all" element={<AllSubscribers />} />
            <Route path="active" element={<ActiveSubscribers />} />
            <Route path="approve" element={<ApproveSubscriber />} />
            <Route path="expired" element={<ExpiredSubscribers />} />
            <Route path="companies" element={<CompanySubscribers />} />
            <Route path="suspended" element={<SuspendedSubscribers />} />
            <Route path="passwords" element={<Passwords />} />
            <Route path="referred" element={<ReferredBy />} />
          </Route>
          <Route path="email">
            <Route path="send-qendrimi" element={<SendEmailQendrimi />} />
            <Route path="send" element={<SendEmail />} />
            <Route path="send-weekly" element={<SendWeeklyEmail />} />
            <Route path="send-delay" element={<SendDelayEmail />} />
            <Route path="send-password" element={<SendPassword />} />
          </Route>
          <Route path="tenders">
            <Route path="qendrim" element={<QendrimiTenders />} />
            <Route path="blini" element={<BliniTenders />} />
            <Route path="tina" element={<TinaTenders />} />
          </Route>
          <Route path="invoices">
            <Route path="generate" element={<GenerateInvoice />} />
          </Route>
          <Route path="logout" element={<LogoutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
