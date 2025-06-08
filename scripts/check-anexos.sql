-- Verificar editais e seus anexos
SELECT 
  e.id as edital_id,
  e.titulo,
  e.codigo,
  COUNT(a.id) as total_anexos
FROM editais e
LEFT JOIN anexos a ON e.id = a.editalId
GROUP BY e.id, e.titulo, e.codigo
ORDER BY e.dataCriacao DESC;

-- Verificar anexos específicos
SELECT 
  a.id,
  a.rotulo,
  a.url,
  a.createdAt,
  e.titulo as edital_titulo
FROM anexos a
JOIN editais e ON a.editalId = e.id
ORDER BY a.createdAt DESC;

-- Verificar se há anexos órfãos
SELECT COUNT(*) as anexos_orfaos
FROM anexos a
LEFT JOIN editais e ON a.editalId = e.id
WHERE e.id IS NULL;
