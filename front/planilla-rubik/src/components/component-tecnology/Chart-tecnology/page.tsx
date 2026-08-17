"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Employee, TechnologyCount } from "@/types/interface";

export default function TechnologyBarChart({
  tecnologyProp,
}: {
  tecnologyProp: Employee[];
}) {
  const [technologyCounts, setTechnologyCounts] = useState<TechnologyCount[]>(
    []
  );
  const [chartHeight, setChartHeight] = useState(500);

  useEffect(() => {
    if (!tecnologyProp) return;

    const technologyMap: Record<string, number> = {};
    const technologyPersonMap: Record<
      string,
      { first_name: string; last_name: string }[]
    > = {};

    tecnologyProp.forEach((employee: Employee) => {
      const techList = employee.tecnologias
        ?.split(";")
        .map((tech: string) => tech.trim())
        .filter((tech: string) => tech);

        console.log("techList", techList);
        
      techList?.forEach((tech: string) => {
        technologyMap[tech] = (technologyMap[tech] || 0) + 1;

        if (!technologyPersonMap[tech]) {
          technologyPersonMap[tech] = [];
        }
        technologyPersonMap[tech].push({
          first_name: employee.first_name,
          last_name: employee.last_name,
        });
      });
    });

    const counts = Object.entries(technologyMap)
      .map(([key, value]) => ({
        tecnologia: key,
        cantidad: value,
        personas: technologyPersonMap[key],
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    setTechnologyCounts(counts);
  }, [tecnologyProp]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setChartHeight(400);
      } else if (width < 960) {
        setChartHeight(450);
      } else {
        setChartHeight(500);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const width = typeof window !== "undefined" ? window.innerWidth : 1024;

  return (
    <div
      style={{
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        width: "calc(95% - 40px)",
        marginLeft: "50px",
        padding: width < 600 ? "10px" : "20px",
      }}
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={technologyCounts.slice(0, 20)}
          layout="vertical"
          margin={{
            top: 20,
            right: width < 600 ? 10 : 20,
            left: width < 600 ? 5 : 10,
            bottom: 20,
          }}
          barCategoryGap="10%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical
            horizontal
            stroke="#E5E7EB"
          />
          <XAxis
            type="number"
            tick={{
              fontSize: width < 600 ? 12 : 14,
              fill: "#6B7280",
            }}
            axisLine={false}
            tickLine={false}

          />
          <YAxis
            type="category"
            dataKey="tecnologia"
            tick={{
              fontSize: width < 600 ? 12 : 14,
              fill: "#374151",
              textAnchor: "end",
            }}
            width={width < 600 ? 80 : 100}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <Tooltip
            contentStyle={{
              color: "black",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              fontSize: width < 600 ? "12px" : "14px",
            }}
            itemStyle={{ color: "black" }}
          />
          <Bar
            dataKey="cantidad"
            radius={[10, 10, 10, 10]}
            barSize={width < 600 ? 20 : 30}
          >
            {technologyCounts.slice(0, 20).map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index % 2 === 0 ? "#00FFD7" : "#438FF9"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
