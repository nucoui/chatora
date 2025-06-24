import type { IC } from "@/main";
import type {
  AbbrChatoraIntrinsicElement,
  AChatoraIntrinsicElement,
  AddressChatoraIntrinsicElement,
  AreaChatoraIntrinsicElement,
  ArticleChatoraIntrinsicElement,
  AsideChatoraIntrinsicElement,
  AudioChatoraIntrinsicElement,
  BaseChatoraIntrinsicElement,
  BChatoraIntrinsicElement,
  BdiChatoraIntrinsicElement,
  BdoChatoraIntrinsicElement,
  BlockquoteChatoraIntrinsicElement,
  BodyChatoraIntrinsicElement,
  BrChatoraIntrinsicElement,
  ButtonChatoraIntrinsicElement,
  CanvasChatoraIntrinsicElement,
  CaptionChatoraIntrinsicElement,
  CircleChatoraIntrinsicElement,
  CiteChatoraIntrinsicElement,
  CodeChatoraIntrinsicElement,
  ColChatoraIntrinsicElement,
  ColgroupChatoraIntrinsicElement,
  DataChatoraIntrinsicElement,
  DatalistChatoraIntrinsicElement,
  DdChatoraIntrinsicElement,
  DelChatoraIntrinsicElement,
  DetailsChatoraIntrinsicElement,
  DfnChatoraIntrinsicElement,
  DialogChatoraIntrinsicElement,
  DivChatoraIntrinsicElement,
  DlChatoraIntrinsicElement,
  DtChatoraIntrinsicElement,
  EllipseChatoraIntrinsicElement,
  EmbedChatoraIntrinsicElement,
  EmChatoraIntrinsicElement,
  FieldsetChatoraIntrinsicElement,
  FigcaptionChatoraIntrinsicElement,
  FigureChatoraIntrinsicElement,
  FooterChatoraIntrinsicElement,
  FormChatoraIntrinsicElement,
  H1ChatoraIntrinsicElement,
  H2ChatoraIntrinsicElement,
  H3ChatoraIntrinsicElement,
  H4ChatoraIntrinsicElement,
  H5ChatoraIntrinsicElement,
  H6ChatoraIntrinsicElement,
  HeadChatoraIntrinsicElement,
  HeaderChatoraIntrinsicElement,
  HgroupChatoraIntrinsicElement,
  HrChatoraIntrinsicElement,
  HtmlChatoraIntrinsicElement,
  IChatoraIntrinsicElement,
  IframeChatoraIntrinsicElement,
  ImgChatoraIntrinsicElement,
  InputChatoraIntrinsicElement,
  InsChatoraIntrinsicElement,
  KbdChatoraIntrinsicElement,
  KeygenChatoraIntrinsicElement, // Deprecated element: not recommended in HTML Living Standard
  LabelChatoraIntrinsicElement,
  LegendChatoraIntrinsicElement,
  LiChatoraIntrinsicElement,
  LineChatoraIntrinsicElement,
  LinkChatoraIntrinsicElement,
  MainChatoraIntrinsicElement,
  MapChatoraIntrinsicElement,
  MarkChatoraIntrinsicElement,
  MenuChatoraIntrinsicElement,
  MetaChatoraIntrinsicElement,
  MeterChatoraIntrinsicElement,
  NavChatoraIntrinsicElement,
  NoscriptChatoraIntrinsicElement,
  ObjectChatoraIntrinsicElement,
  OlChatoraIntrinsicElement,
  OptgroupChatoraIntrinsicElement,
  OptionChatoraIntrinsicElement,
  OutputChatoraIntrinsicElement,
  ParamChatoraIntrinsicElement,
  PathChatoraIntrinsicElement,
  PChatoraIntrinsicElement,
  PictureChatoraIntrinsicElement,
  PolygonChatoraIntrinsicElement,
  PolylineChatoraIntrinsicElement,
  PreChatoraIntrinsicElement,
  ProgressChatoraIntrinsicElement,
  QChatoraIntrinsicElement,
  RectChatoraIntrinsicElement,
  RpChatoraIntrinsicElement,
  RtChatoraIntrinsicElement,
  RubyChatoraIntrinsicElement,
  SampChatoraIntrinsicElement,
  SChatoraIntrinsicElement,
  ScriptChatoraIntrinsicElement,
  SectionChatoraIntrinsicElement,
  SelectChatoraIntrinsicElement,
  SlotChatoraIntrinsicElement,
  SmallChatoraIntrinsicElement,
  SourceChatoraIntrinsicElement,
  SpanChatoraIntrinsicElement,
  StrongChatoraIntrinsicElement,
  StyleChatoraIntrinsicElement,
  SubChatoraIntrinsicElement,
  SummaryChatoraIntrinsicElement,
  SupChatoraIntrinsicElement,
  SvgChatoraIntrinsicElement,
  TableChatoraIntrinsicElement,
  TbodyChatoraIntrinsicElement,
  TdChatoraIntrinsicElement,
  TemplateChatoraIntrinsicElement,
  TextareaChatoraIntrinsicElement,
  TextChatoraIntrinsicElement,
  TfootChatoraIntrinsicElement,
  ThChatoraIntrinsicElement,
  TheadChatoraIntrinsicElement,
  TimeChatoraIntrinsicElement,
  TitleChatoraIntrinsicElement,
  TrackChatoraIntrinsicElement,
  TrChatoraIntrinsicElement,
  UChatoraIntrinsicElement,
  UlChatoraIntrinsicElement,
  VarChatoraIntrinsicElement,
  VideoChatoraIntrinsicElement,
  WbrChatoraIntrinsicElement,
} from "@root/types/IntrinsicElements";

export type ChatoraNode =
  | string
  | number
  | ChatoraJSXElement
  | ChatoraNode[]
  | null
  | boolean
  | undefined;

export type FunctionComponentResult = ChatoraNode | Promise<ChatoraNode>;

export interface HTMLElementEvent<T extends EventTarget> extends Event {
  target: T;
}

export interface ChatoraJSXElement {
  tag: string | IC;
  props: Record<string, unknown>;
}

declare global {
  namespace JSX {
    /**
     * Intrinsic elements mapping for JSX (WHATWG HTML/SVG spec)
     */
    interface IntrinsicElements {
      div: DivChatoraIntrinsicElement;
      h1: H1ChatoraIntrinsicElement;
      h2: H2ChatoraIntrinsicElement;
      h3: H3ChatoraIntrinsicElement;
      h4: H4ChatoraIntrinsicElement;
      h5: H5ChatoraIntrinsicElement;
      h6: H6ChatoraIntrinsicElement;
      p: PChatoraIntrinsicElement;
      ul: UlChatoraIntrinsicElement;
      ol: OlChatoraIntrinsicElement;
      li: LiChatoraIntrinsicElement;
      span: SpanChatoraIntrinsicElement;
      button: ButtonChatoraIntrinsicElement;
      canvas: CanvasChatoraIntrinsicElement;
      caption: CaptionChatoraIntrinsicElement;
      cite: CiteChatoraIntrinsicElement;
      code: CodeChatoraIntrinsicElement;
      col: ColChatoraIntrinsicElement;
      colgroup: ColgroupChatoraIntrinsicElement;
      data: DataChatoraIntrinsicElement;
      datalist: DatalistChatoraIntrinsicElement;
      dd: DdChatoraIntrinsicElement;
      del: DelChatoraIntrinsicElement;
      details: DetailsChatoraIntrinsicElement;
      dfn: DfnChatoraIntrinsicElement;
      dialog: DialogChatoraIntrinsicElement;
      dl: DlChatoraIntrinsicElement;
      dt: DtChatoraIntrinsicElement;
      em: EmChatoraIntrinsicElement;
      embed: EmbedChatoraIntrinsicElement;
      fieldset: FieldsetChatoraIntrinsicElement;
      figcaption: FigcaptionChatoraIntrinsicElement;
      figure: FigureChatoraIntrinsicElement;
      footer: FooterChatoraIntrinsicElement;
      form: FormChatoraIntrinsicElement;
      head: HeadChatoraIntrinsicElement;
      header: HeaderChatoraIntrinsicElement;
      hgroup: HgroupChatoraIntrinsicElement;
      hr: HrChatoraIntrinsicElement;
      html: HtmlChatoraIntrinsicElement;
      i: IChatoraIntrinsicElement;
      iframe: IframeChatoraIntrinsicElement;
      img: ImgChatoraIntrinsicElement;
      input: InputChatoraIntrinsicElement;
      ins: InsChatoraIntrinsicElement;
      kbd: KbdChatoraIntrinsicElement;
      keygen: KeygenChatoraIntrinsicElement; // Deprecated element: not recommended in HTML Living Standard
      label: LabelChatoraIntrinsicElement;
      legend: LegendChatoraIntrinsicElement;
      link: LinkChatoraIntrinsicElement;
      main: MainChatoraIntrinsicElement;
      map: MapChatoraIntrinsicElement;
      mark: MarkChatoraIntrinsicElement;
      menu: MenuChatoraIntrinsicElement;
      meta: MetaChatoraIntrinsicElement;
      meter: MeterChatoraIntrinsicElement;
      nav: NavChatoraIntrinsicElement;
      noscript: NoscriptChatoraIntrinsicElement;
      object: ObjectChatoraIntrinsicElement;
      optgroup: OptgroupChatoraIntrinsicElement;
      option: OptionChatoraIntrinsicElement;
      output: OutputChatoraIntrinsicElement;
      param: ParamChatoraIntrinsicElement;
      picture: PictureChatoraIntrinsicElement;
      pre: PreChatoraIntrinsicElement;
      progress: ProgressChatoraIntrinsicElement;
      q: QChatoraIntrinsicElement;
      rp: RpChatoraIntrinsicElement;
      rt: RtChatoraIntrinsicElement;
      ruby: RubyChatoraIntrinsicElement;
      s: SChatoraIntrinsicElement;
      samp: SampChatoraIntrinsicElement;
      script: ScriptChatoraIntrinsicElement;
      section: SectionChatoraIntrinsicElement;
      select: SelectChatoraIntrinsicElement;
      small: SmallChatoraIntrinsicElement;
      source: SourceChatoraIntrinsicElement;
      strong: StrongChatoraIntrinsicElement;
      style: StyleChatoraIntrinsicElement;
      sub: SubChatoraIntrinsicElement;
      summary: SummaryChatoraIntrinsicElement;
      sup: SupChatoraIntrinsicElement;
      table: TableChatoraIntrinsicElement;
      tbody: TbodyChatoraIntrinsicElement;
      td: TdChatoraIntrinsicElement;
      template: TemplateChatoraIntrinsicElement;
      textarea: TextareaChatoraIntrinsicElement;
      tfoot: TfootChatoraIntrinsicElement;
      th: ThChatoraIntrinsicElement;
      thead: TheadChatoraIntrinsicElement;
      time: TimeChatoraIntrinsicElement;
      title: TitleChatoraIntrinsicElement;
      tr: TrChatoraIntrinsicElement;
      track: TrackChatoraIntrinsicElement;
      u: UChatoraIntrinsicElement;
      ul: UlChatoraIntrinsicElement;
      var: VarChatoraIntrinsicElement;
      video: VideoChatoraIntrinsicElement;
      wbr: WbrChatoraIntrinsicElement;
      a: AChatoraIntrinsicElement;
      abbr: AbbrChatoraIntrinsicElement;
      address: AddressChatoraIntrinsicElement;
      area: AreaChatoraIntrinsicElement;
      article: ArticleChatoraIntrinsicElement;
      aside: AsideChatoraIntrinsicElement;
      audio: AudioChatoraIntrinsicElement;
      base: BaseChatoraIntrinsicElement;
      b: BChatoraIntrinsicElement;
      bdi: BdiChatoraIntrinsicElement;
      bdo: BdoChatoraIntrinsicElement;
      blockquote: BlockquoteChatoraIntrinsicElement;
      body: BodyChatoraIntrinsicElement;
      br: BrChatoraIntrinsicElement;
      svg: SvgChatoraIntrinsicElement;
      path: PathChatoraIntrinsicElement;
      circle: CircleChatoraIntrinsicElement;
      rect: RectChatoraIntrinsicElement;
      line: LineChatoraIntrinsicElement;
      polyline: PolylineChatoraIntrinsicElement;
      polygon: PolygonChatoraIntrinsicElement;
      ellipse: EllipseChatoraIntrinsicElement;
      text: TextChatoraIntrinsicElement;
      slot: SlotChatoraIntrinsicElement;
    }

    // The type of element generated when writing <div>...</div> in JSX syntax (the return type of JSX)
    type Element = ChatoraJSXElement;

    // The type of tag usable in JSX (HTML tag name or function component)
    type ElementType<P = any> = string | IC<P>;

    // Type for props type completion
    type LibraryManagedAttributes<C, P> =
      C extends (props: infer Props) => any ? Props : P;

    // Specify which property name in props receives children in JSX
    interface ElementChildrenAttribute {
      children: unknown;
    }
  }
}
