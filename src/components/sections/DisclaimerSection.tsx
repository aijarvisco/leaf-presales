export default function DisclaimerSection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <ul className="list-disc list-inside space-y-2 text-sm text-[#6B6B6B]">
          <li>
            Os valores apresentados são indicativos e servem apenas para efeitos de comparação.
          </li>
          <li>
            A autonomia de 320 km refere-se ao MICRA 40 kWh e os 415 km referem-se ao MICRA 52 kWh.
            Os resultados reais em uso podem variar dependendo de fatores como o nível inicial de
            carga da bateria, acessórios adicionados após homologação, condições meteorológicas,
            estilos de condução e carga do veículo.
          </li>
        </ul>
      </div>
    </section>
  )
}
