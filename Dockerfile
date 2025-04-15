FROM node:18

WORKDIR /app

COPY package*.json ./


ENV VITE_GOOGLE_API_KEY=AIzaSyCHEKiraViKIrgvloZI-ZBIJqtDMeBuQD0
ENV VITE_GOOGLE_SEARCH_ENGINE_ID=e1abd3780ba01461a
ENV VITE_OPENAI_API_KEY=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
ENV VITE_SUPABASE_URL=https://uvngyzyuwycnmokvzpaa.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbXN3cHhuYXRsZHBzbW5kcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNDYyNjIsImV4cCI6MjA1MTgyMjI2Mn0.gBI2-Vbex1brojL2Izo-FPMOWzs8buzg64oM_8FzBr0
ENV VITE_SUPABASE_URL=https://himswpxnatldpsmndqlf.supabase.co
ENV VITE_API_URL=https://preprod-api-companysearchwizard.harx.ai/api

RUN npm install
RUN npm i --save-dev @types/js-cookie

COPY . .

RUN npm run build --force

RUN npm install -g serve

EXPOSE 5176

CMD ["serve", "-s", "dist", "-l", "5176"]