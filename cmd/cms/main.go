package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"golang.org/x/sys/unix"
)

// CONFIG: Absolute path mapping
const ProjectRoot = "/Users/scroobz/Navigation/saily"

type item struct {
	title, desc, path string
	isDir             bool
	icon              string
}

func (i item) Title() string       { return i.title }
func (i item) Description() string { return i.desc }
func (i item) FilterValue() string { return i.title }

func renderListLines(title string, items []item, selectedIndex int, width int, height int) []string {
	if width < 1 {
		width = 1
	}
	if height < 1 {
		height = 1
	}

	lines := []string{title, strings.Repeat("-", min(width, len(title)))}

	for index, entry := range items {
		prefix := "  "
		icon := "•"
		if entry.isDir {
			icon = "▸"
		}
		if index == selectedIndex {
			prefix = "> "
		}
		lines = append(lines, prefix+icon+" "+entry.Title())
	}

	if len(lines) > height {
		lines = lines[:height]
	}
	for len(lines) < height {
		lines = append(lines, "")
	}
	for i := range lines {
		lines[i] = padRight(lines[i], width)
	}
	return lines
}

type model struct {
	sidebarItems   []item
	sidebarIndex   int
	discoveryItems []item
	discoveryIndex int
	currPath       string
	width          int
	height         int
	discoveryOn    bool
}

func getIcon(name string, isDir bool) string {
	return ""
}

func (m *model) updateEntries() {
	files, _ := ioutil.ReadDir(m.currPath)
	var items []item

	// Navigation Up
	if m.currPath != filepath.Join(ProjectRoot, "web/content") {
		items = append(items, item{title: "..", desc: "Go back", path: filepath.Dir(m.currPath), isDir: true, icon: "⬆"})
	}

	// Directories
	for _, f := range files {
		if f.IsDir() && !strings.HasPrefix(f.Name(), ".") {
			items = append(items, item{
				title: f.Name(),
				desc:  "Folder",
				path:  filepath.Join(m.currPath, f.Name()),
				isDir: true,
				icon:  getIcon(f.Name(), true),
			})
		}
	}
	// Files
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".md") && f.Name() != "README.md" {
			items = append(items, item{
				title: f.Name(),
				desc:  fmt.Sprintf("Modified %s", f.ModTime().Format("02 Jan")),
				path:  filepath.Join(m.currPath, f.Name()),
				isDir: false,
				icon:  getIcon(f.Name(), false),
			})
		}
	}
	m.sidebarItems = items
	if m.sidebarIndex >= len(m.sidebarItems) {
		m.sidebarIndex = len(m.sidebarItems) - 1
	}
	if m.sidebarIndex < 0 {
		m.sidebarIndex = 0
	}
}

func (m *model) updateDiscovery() {
	inboxPath := filepath.Join(ProjectRoot, "web/content/inbox")
	files, _ := ioutil.ReadDir(inboxPath)
	var items []item
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".md") && f.Name() != "README.md" {
			items = append(items, item{
				title: f.Name(),
				desc:  "Candidate Story",
				path:  filepath.Join(inboxPath, f.Name()),
				isDir: false,
				icon:  "💡",
			})
		}
	}
	m.discoveryItems = items
	if m.discoveryIndex >= len(m.discoveryItems) {
		m.discoveryIndex = len(m.discoveryItems) - 1
	}
	if m.discoveryIndex < 0 {
		m.discoveryIndex = 0
	}
}

func initialModel() model {
	m := model{
		currPath: filepath.Join(ProjectRoot, "web/content"),
	}
	m.updateEntries()
	m.updateDiscovery()
	return m
}

func (m *model) moveUp() {
	if m.discoveryOn {
		if m.discoveryIndex > 0 {
			m.discoveryIndex--
		}
		return
	}
	if m.sidebarIndex > 0 {
		m.sidebarIndex--
	}
}

func (m *model) moveDown() {
	if m.discoveryOn {
		if m.discoveryIndex < len(m.discoveryItems)-1 {
			m.discoveryIndex++
		}
		return
	}
	if m.sidebarIndex < len(m.sidebarItems)-1 {
		m.sidebarIndex++
	}
}

func (m *model) handleMouse(x int, y int, release bool, term *terminalState) {
	sidebarWidth, mainWidth, trayWidth := m.layoutWidthsFor(drawableWidth(m.width))
	if x >= 0 && x < sidebarWidth {
		if index, ok := listIndexAtRow(y); ok && index < len(m.sidebarItems) {
			m.discoveryOn = false
			m.sidebarIndex = index
			if release {
				m.openActiveItem(term)
			}
		}
		return
	}

	trayStart := sidebarWidth + 1 + mainWidth + 1
	if m.discoveryOn && trayWidth > 0 && x >= trayStart && x < trayStart+trayWidth {
		if index, ok := listIndexAtRow(y); ok && index < len(m.discoveryItems) {
			m.discoveryIndex = index
			if release {
				m.openActiveItem(term)
			}
		}
	}
}

func listIndexAtRow(row int) (int, bool) {
	if row < 2 {
		return 0, false
	}
	return row - 2, true
}

func (m *model) openActiveItem(term *terminalState) {
	selected, ok := m.activeNavigationItem()
	if !ok {
		return
	}
	if m.discoveryOn {
		m.editFile(selected.path, term)
		return
	}

	if selected.isDir {
		m.currPath = selected.path
		m.updateEntries()
		m.sidebarIndex = 0
		return
	}
	m.editFile(selected.path, term)
}

func (m model) activeNavigationItem() (item, bool) {
	if m.discoveryOn {
		if len(m.discoveryItems) == 0 || m.discoveryIndex < 0 || m.discoveryIndex >= len(m.discoveryItems) {
			return item{}, false
		}
		return m.discoveryItems[m.discoveryIndex], true
	}
	if len(m.sidebarItems) == 0 || m.sidebarIndex < 0 || m.sidebarIndex >= len(m.sidebarItems) {
		return item{}, false
	}
	return m.sidebarItems[m.sidebarIndex], true
}

func (m model) View() string {
	width := m.width
	height := m.height
	if width <= 0 {
		width = 100
	}
	if height <= 0 {
		height = 30
	}
	drawWidth := drawableWidth(width)

	bodyHeight := height - 1
	sidebarWidth, mainWidth, trayWidth := m.layoutWidthsFor(drawWidth)

	activeItem, hasActiveItem := m.activeNavigationItem()
	var mainSource string
	if hasActiveItem && activeItem.path != "" && !activeItem.isDir {
		content, _ := ioutil.ReadFile(activeItem.path)
		mainSource = fmt.Sprintf("%s\n%s\n\n%s", activeItem.title, strings.Repeat("=", len(activeItem.title)), string(content))
	} else {
		mainSource = "Select a file to preview dispatches."
	}

	sidebarLines := renderSidebarRows("files", m.sidebarItems, m.sidebarIndex, sidebarWidth, bodyHeight)
	mainLines := renderDocumentRows(strings.ToLower(filepath.Base(m.currPath)), mainSource, mainWidth, bodyHeight)
	var trayLines []string
	if trayWidth > 0 {
		trayLines = renderSidebarRows("discovery", m.discoveryItems, m.discoveryIndex, trayWidth, bodyHeight)
	}

	rows := make([]string, 0, height)
	for row := 0; row < bodyHeight; row++ {
		sidebarBg := "243;241;236"
		if strings.HasPrefix(sidebarLines[row], "> ") {
			sidebarBg = "221;215;206"
		}
		line := paintLineBg(sidebarLines[row], sidebarWidth, sidebarBg, "22;24;28") +
			separatorCell("243;241;236") +
			paintLineBg(mainLines[row], mainWidth, "248;246;242", "22;24;28")
		if trayWidth > 0 {
			trayBg := "243;241;236"
			if strings.HasPrefix(trayLines[row], "> ") {
				trayBg = "221;215;206"
			}
			line += separatorCell("248;246;242") +
				paintLineBg(trayLines[row], trayWidth, trayBg, "22;24;28")
		}
		rows = append(rows, line)
	}
	status := fmt.Sprintf("THE DAILY TRANSIT | %s | n new | enter edit/open | tab discovery | q quit", m.currPath)
	if m.discoveryOn {
		status = fmt.Sprintf("DISCOVERY TRAY | %s | enter edit | tab close | q quit", m.currPath)
	}
	rows = append(rows, paintLineBg(fit(status, drawWidth), drawWidth, "208;192;179", "22;24;28"))
	return strings.Join(rows, "\n")
}

func drawableWidth(width int) int {
	if width <= 0 {
		return 99
	}
	if width <= 20 {
		return width
	}
	return width - 1
}

func (m model) layoutWidthsFor(width int) (int, int, int) {
	sidebarWidth := 30
	if width < 90 {
		sidebarWidth = 24
	}
	trayWidth := 0
	if m.discoveryOn && width >= 100 {
		trayWidth = 30
	}
	mainWidth := width - sidebarWidth - 1 - trayWidth
	if trayWidth > 0 {
		mainWidth--
	}
	if mainWidth < 20 {
		mainWidth = 20
	}
	return sidebarWidth, mainWidth, trayWidth
}

func paintLine(text string, width int) string {
	return "\x1b[38;2;22;24;28;48;2;255;255;255m" + padRight(text, width) + "\x1b[0m"
}

func paintLineBg(text string, width int, bg string, fg string) string {
	return "\x1b[38;2;" + fg + ";48;2;" + bg + "m" + padRight(text, width) + "\x1b[0m"
}

func separatorCell(bg string) string {
	return "\x1b[38;2;198;190;180;48;2;" + bg + "m│\x1b[0m"
}

func renderSidebarRows(title string, items []item, selectedIndex int, width int, height int) []string {
	rows := make([]string, height)
	titleLine := " " + strings.ToLower(title)
	rows[0] = fit(titleLine, width)
	rows[1] = strings.Repeat("─", width)
	for i := 2; i < height; i++ {
		itemIndex := i - 2
		if itemIndex >= len(items) {
			rows[i] = ""
			continue
		}
		entry := items[itemIndex]
		prefix := "  "
		if itemIndex == selectedIndex {
			prefix = "> "
		}
		glyph := "•"
		if entry.isDir {
			glyph = "▸"
		}
		rows[i] = fit(prefix+glyph+" "+entry.Title(), width)
	}
	return rows
}

func renderDocumentRows(title string, source string, width int, height int) []string {
	rows := make([]string, height)
	if title == "" {
		title = "preview"
	}
	rows[0] = fit(" "+title, width)
	rows[1] = strings.Repeat("─", min(width, 2))
	preview := wrapLines(source, width, height-2)
	for i := 2; i < height; i++ {
		rows[i] = preview[i-2]
	}
	return rows
}

func padRight(text string, width int) string {
	text = fit(text, width)
	padding := width - len([]rune(text))
	if padding <= 0 {
		return text
	}
	return text + strings.Repeat(" ", padding)
}

func fit(text string, width int) string {
	if width <= 0 {
		return ""
	}
	text = strings.ReplaceAll(text, "\t", "  ")
	runes := []rune(text)
	if len(runes) <= width {
		return text
	}
	if width == 1 {
		return string(runes[:1])
	}
	return string(runes[:width-1]) + "…"
}

func wrapLines(text string, width int, height int) []string {
	lines := make([]string, 0, height)
	for _, paragraph := range strings.Split(text, "\n") {
		paragraph = strings.ReplaceAll(paragraph, "\t", "  ")
		runes := []rune(paragraph)
		if len(runes) == 0 {
			lines = append(lines, "")
		}
		for len(runes) > 0 {
			take := width
			if len(runes) < take {
				take = len(runes)
			}
			lines = append(lines, string(runes[:take]))
			runes = runes[take:]
		}
		if len(lines) >= height {
			break
		}
	}
	for len(lines) < height {
		lines = append(lines, "")
	}
	if len(lines) > height {
		lines = lines[:height]
	}
	for i := range lines {
		lines[i] = padRight(lines[i], width)
	}
	return lines
}

type terminalState struct {
	fd  int
	old *unix.Termios
}

func runEditor() error {
	term, err := enterTerminal()
	if err != nil {
		return err
	}
	defer term.close()

	m := initialModel()
	for {
		m.width, m.height = terminalSize(term.fd)
		render(m)

		event, err := readEvent(os.Stdin)
		if err != nil {
			return err
		}
		switch event.kind {
		case "quit":
			return nil
		case "tab":
			m.discoveryOn = !m.discoveryOn
		case "up":
			m.moveUp()
		case "down":
			m.moveDown()
		case "enter":
			m.openActiveItem(term)
		case "new":
			m.createNew(term)
		case "mouse":
			m.handleMouse(event.x, event.y, event.release, term)
		}
	}
}

func enterTerminal() (*terminalState, error) {
	fd := int(os.Stdin.Fd())
	old, err := unix.IoctlGetTermios(fd, unix.TIOCGETA)
	if err != nil {
		return nil, err
	}
	term := &terminalState{fd: fd, old: old}
	if err := term.resume(); err != nil {
		return nil, err
	}
	fmt.Print("\x1b[?1049h\x1b[?25l\x1b[?1000h\x1b[?1006h\x1b[48;2;255;255;255m\x1b[2J\x1b[H")
	return term, nil
}

func (t *terminalState) resume() error {
	raw := *t.old
	raw.Iflag &^= unix.BRKINT | unix.ICRNL | unix.INPCK | unix.ISTRIP | unix.IXON
	raw.Oflag &^= unix.OPOST
	raw.Cflag |= unix.CS8
	raw.Lflag &^= unix.ECHO | unix.ICANON | unix.IEXTEN | unix.ISIG
	raw.Cc[unix.VMIN] = 1
	raw.Cc[unix.VTIME] = 0
	if err := unix.IoctlSetTermios(t.fd, unix.TIOCSETA, &raw); err != nil {
		return err
	}
	fmt.Print("\x1b[?25l\x1b[?1000h\x1b[?1006h")
	return nil
}

func (t *terminalState) suspend() {
	fmt.Print("\x1b[?1000l\x1b[?1006l\x1b[?25h\x1b[?1049l")
	_ = unix.IoctlSetTermios(t.fd, unix.TIOCSETA, t.old)
}

func (t *terminalState) close() {
	t.suspend()
}

func terminalSize(fd int) (int, int) {
	size, err := unix.IoctlGetWinsize(fd, unix.TIOCGWINSZ)
	if err != nil || size.Col == 0 || size.Row == 0 {
		return 100, 30
	}
	return int(size.Col), int(size.Row)
}

func render(m model) {
	fmt.Print("\x1b[H", m.View())
}

type inputEvent struct {
	kind    string
	x       int
	y       int
	release bool
}

func readEvent(in *os.File) (inputEvent, error) {
	buf := make([]byte, 1)
	for {
		if _, err := in.Read(buf); err != nil {
			return inputEvent{}, err
		}
		switch buf[0] {
		case 'q', 3:
			return inputEvent{kind: "quit"}, nil
		case '\t':
			return inputEvent{kind: "tab"}, nil
		case 'k':
			return inputEvent{kind: "up"}, nil
		case 'j':
			return inputEvent{kind: "down"}, nil
		case 'n':
			return inputEvent{kind: "new"}, nil
		case '\r', '\n':
			return inputEvent{kind: "enter"}, nil
		case 0x1b:
			event, ok, err := readEscape(in)
			if err != nil {
				return inputEvent{}, err
			}
			if ok {
				return event, nil
			}
		}
	}
}

func readEscape(in *os.File) (inputEvent, bool, error) {
	buf := make([]byte, 1)
	if _, err := in.Read(buf); err != nil {
		return inputEvent{}, false, err
	}
	if buf[0] != '[' {
		return inputEvent{}, false, nil
	}
	if _, err := in.Read(buf); err != nil {
		return inputEvent{}, false, err
	}
	switch buf[0] {
	case 'A':
		return inputEvent{kind: "up"}, true, nil
	case 'B':
		return inputEvent{kind: "down"}, true, nil
	case '<':
		return readMouseEvent(in)
	default:
		return inputEvent{}, false, nil
	}
}

func readMouseEvent(in *os.File) (inputEvent, bool, error) {
	var b strings.Builder
	buf := make([]byte, 1)
	final := byte(0)
	for {
		if _, err := in.Read(buf); err != nil {
			return inputEvent{}, false, err
		}
		if buf[0] == 'M' || buf[0] == 'm' {
			final = buf[0]
			break
		}
		b.WriteByte(buf[0])
	}
	parts := strings.Split(b.String(), ";")
	if len(parts) != 3 {
		return inputEvent{}, false, nil
	}
	button, err1 := strconv.Atoi(parts[0])
	x, err2 := strconv.Atoi(parts[1])
	y, err3 := strconv.Atoi(parts[2])
	if err1 != nil || err2 != nil || err3 != nil {
		return inputEvent{}, false, nil
	}
	if button != 0 {
		return inputEvent{}, false, nil
	}
	return inputEvent{kind: "mouse", x: x - 1, y: y - 1, release: final == 'm'}, true, nil
}

func (m *model) editFile(path string, term *terminalState) {
	editor := os.Getenv("EDITOR")
	if editor == "" {
		editor = "vim"
	}
	term.suspend()
	c := exec.Command(editor, path)
	c.Stdin = os.Stdin
	c.Stdout = os.Stdout
	c.Stderr = os.Stderr
	_ = c.Run()
	term.resume()
	m.updateEntries()
	m.updateDiscovery()
}

func (m *model) createNew(term *terminalState) {
	now := time.Now().Format("2006-01-02T15:04:05Z")
	filename := fmt.Sprintf("dispatch-%d.md", time.Now().Unix())
	path := filepath.Join(m.currPath, filename)

	tmpl := fmt.Sprintf("---\ntitle: New Dispatch\nslug: %s\nstatus: draft\npublishedAt: %s\nupdatedAt: %s\n---\n\nWrite your story here.",
		strings.TrimSuffix(filename, ".md"), now, now)

	_ = ioutil.WriteFile(path, []byte(tmpl), 0644)
	m.editFile(path, term)
}

func main() {
	if err := runEditor(); err != nil {
		fmt.Printf("Error: %v", err)
		os.Exit(1)
	}
}
