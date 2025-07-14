import { UserDetail } from "@/app/provider";
import { AnyARecord } from "node:dns";
import { createContext } from "react";


export const UserDetailContext = createContext<any>(undefined);