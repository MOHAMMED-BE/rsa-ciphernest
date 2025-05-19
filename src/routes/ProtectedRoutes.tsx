import { MainLayout } from "@/components/layouts/MainLayout";
import {  useOutlet } from "react-router-dom";

export const ProtectedRoute = () => {

    let outlet = useOutlet();

    return (
        <MainLayout>
            <div className="min-h-screen mx-auto" >
                {outlet}
            </div>
        </MainLayout>
    );
};